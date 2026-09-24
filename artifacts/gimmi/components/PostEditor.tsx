import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Modal, Pressable, LayoutChangeEvent } from 'react-native';
import { Text, Icon } from '@/components/GimmiUI';
import { useColors } from '@/hooks/useColors';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, runOnJS } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

/**
 * Everything in this file is a LIVE PREVIEW layer only. There IS an upload
 * endpoint now (POST /api/upload, see create/image.tsx and create/video.tsx)
 * so the original picked photo/video reaches the server and is visible to
 * everyone — but filters, draw strokes, and text overlays are still not
 * rasterized into that uploaded file. There's no image-processing library in
 * this project (no expo-image-manipulator, no Skia), so what ships to the
 * server is the untouched original. Wiring real compositing needs either a
 * native image-manipulation dependency + client-side rendering, or a
 * server-side compositing step. Flagging clearly rather than pretending
 * "Next" bakes these in.
 */

// ---------------------------------------------------------------------------
// Filters — approximated as translucent color overlays, not true per-pixel
// filters (that needs a GPU shader / Skia, which isn't in this project).
// ---------------------------------------------------------------------------
export type FilterKey = 'original' | 'vivid' | 'warm' | 'cool';

export const FILTERS: { key: FilterKey; label: string; overlayColor?: string; opacity?: number }[] = [
  { key: 'original', label: 'Original' },
  { key: 'vivid', label: 'Vivid', overlayColor: '#FF9F0A', opacity: 0.05 },
  { key: 'warm', label: 'Warm', overlayColor: '#FF6B00', opacity: 0.14 },
  { key: 'cool', label: 'Cool', overlayColor: '#0A84FF', opacity: 0.14 },
];

export function FilterFilmstrip({ value, onChange }: { value: FilterKey; onChange: (k: FilterKey) => void }) {
  const colors = useColors();
  return (
    <View style={styles.filmstripRow}>
      {FILTERS.map((f) => (
        <Pressable key={f.key} onPress={() => onChange(f.key)} style={styles.filmstripItem} accessibilityRole="button" accessibilityLabel={`${f.label} filter`}>
          <View style={[styles.filmstripSwatch, { borderColor: value === f.key ? colors.tint : 'transparent' }]}>
            <View style={[styles.filmstripFill, { backgroundColor: f.overlayColor ?? colors.muted, opacity: f.overlayColor ? 0.5 : 1 }]} />
          </View>
          <Text style={{ fontSize: 12, color: value === f.key ? colors.tint : colors.mutedForeground, marginTop: 4 }}>{f.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// Renders the filter + B&W + brightness look on top of whatever media sits
// underneath it. Absolutely positioned, pointerEvents="none" so it never
// blocks gestures meant for the canvas below.
export function LookOverlay({ filter, blackAndWhite, brightness }: { filter: FilterKey; blackAndWhite: boolean; brightness: number }) {
  const active = FILTERS.find((f) => f.key === filter);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {active?.overlayColor ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: active.overlayColor, opacity: active.opacity }]} />
      ) : null}
      {blackAndWhite ? <View style={[StyleSheet.absoluteFill, { backgroundColor: '#8E8E93', opacity: 0.55 }]} /> : null}
      {brightness > 0 ? <View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF', opacity: brightness * 0.35 }]} /> : null}
      {brightness < 0 ? <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000000', opacity: -brightness * 0.45 }]} /> : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Adjust — a custom slider since @react-native-community/slider isn't a
// dependency here. Built on gesture-handler + reanimated, both already used
// elsewhere in this app.
// ---------------------------------------------------------------------------
export function EditorSlider({ label, value, onChange, min = -1, max = 1 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  const colors = useColors();
  const [trackWidth, setTrackWidth] = useState(0);
  const translateX = useSharedValue(((value - min) / (max - min)) * trackWidth);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setTrackWidth(w);
    translateX.value = ((value - min) / (max - min)) * w;
  };

  const setValueFromX = (x: number) => {
    const clamped = Math.max(0, Math.min(trackWidth, x));
    const ratio = trackWidth > 0 ? clamped / trackWidth : 0;
    onChange(min + ratio * (max - min));
  };

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onStart((e) => setValueFromX(e.x))
    .onUpdate((e) => setValueFromX(e.x));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: Math.max(0, Math.min(trackWidth, ((value - min) / (max - min)) * trackWidth)) - 10 }],
  }));

  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: '600' }}>{label}</Text>
        <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>{Math.round(((value - min) / (max - min)) * 200 - 100)}</Text>
      </View>
      <GestureDetector gesture={pan}>
        <View onLayout={onLayout} style={[styles.sliderTrack, { backgroundColor: colors.muted }]}>
          <View style={[styles.sliderFill, { backgroundColor: colors.tint, width: `${((value - min) / (max - min)) * 100}%` }]} />
          <Animated.View style={[styles.sliderThumb, { backgroundColor: colors.tint }, thumbStyle]} />
        </View>
      </GestureDetector>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Draw — freehand strokes via react-native-svg. Self-contained: strokes stay
// visible on screen even when draw mode is toggled off, since that's just
// disabling the gesture, not unmounting the canvas.
// ---------------------------------------------------------------------------
export const DRAW_COLORS = ['#FFFFFF', '#000000', '#FF3B30', '#FF9F0A', '#34C759', '#0A84FF'];

type StrokePath = { d: string; color: string };

export function DrawCanvas({ enabled, color }: { enabled: boolean; color: string }) {
  const [paths, setPaths] = useState<StrokePath[]>([]);
  const [current, setCurrent] = useState<string>('');

  const pan = Gesture.Pan()
    .runOnJS(true)
    .enabled(enabled)
    .onStart((e) => setCurrent(`M${e.x.toFixed(1)},${e.y.toFixed(1)}`))
    .onUpdate((e) => setCurrent((p) => `${p} L${e.x.toFixed(1)},${e.y.toFixed(1)}`))
    .onEnd(() => {
      setCurrent((p) => {
        if (p) setPaths((prev) => [...prev, { d: p, color }]);
        return '';
      });
    });

  return (
    <GestureDetector gesture={pan}>
      <View style={[StyleSheet.absoluteFill, enabled && { backgroundColor: 'rgba(0,0,0,0.001)' }]}>
        <Svg style={StyleSheet.absoluteFill}>
          {paths.map((p, i) => (
            <Path key={i} d={p.d} stroke={p.color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ))}
          {current ? <Path d={current} stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
        </Svg>
      </View>
    </GestureDetector>
  );
}

export function ColorSwatchRow({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 14, paddingHorizontal: 4 }}>
      {DRAW_COLORS.map((c) => (
        <Pressable
          key={c}
          onPress={() => onChange(c)}
          accessibilityRole="button"
          accessibilityLabel={`Use ${c} color`}
          style={[styles.swatch, { backgroundColor: c, borderWidth: value === c ? 3 : StyleSheet.hairlineWidth, borderColor: value === c ? '#0A84FF' : 'rgba(128,128,128,0.4)' }]}
        />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Text overlay — each item drags independently; position lives in the item,
// not the parent, so the parent only tracks {id, text, color}.
// ---------------------------------------------------------------------------
export type TextLayer = { id: string; text: string; color: string };

function DraggableTextItem({ layer, canvasWidth, canvasHeight, index }: { layer: TextLayer; canvasWidth: number; canvasHeight: number; index: number }) {
  const translateX = useSharedValue(canvasWidth / 2 - 60);
  const translateY = useSharedValue(canvasHeight / 2 - 20 + index * 36);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.textLayer, style]}>
        <Text style={{ color: layer.color, fontSize: 22, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 4 }}>
          {layer.text}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

export function TextLayerCanvas({ layers, canvasWidth, canvasHeight }: { layers: TextLayer[]; canvasWidth: number; canvasHeight: number }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {layers.map((l, i) => (
        <DraggableTextItem key={l.id} layer={l} canvasWidth={canvasWidth} canvasHeight={canvasHeight} index={i} />
      ))}
    </View>
  );
}

export function AddTextModal({ visible, onClose, onSubmit }: { visible: boolean; onClose: () => void; onSubmit: (text: string, color: string) => void }) {
  const colors = useColors();
  const [text, setText] = useState('');
  const [color, setColor] = useState('#FFFFFF');

  const submit = () => {
    if (text.trim()) onSubmit(text.trim(), color);
    setText('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
          <TextInput
            autoFocus
            placeholder="Add text…"
            placeholderTextColor={colors.mutedForeground}
            value={text}
            onChangeText={setText}
            style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border }]}
            multiline
          />
          <View style={{ marginTop: 16 }}>
            <ColorSwatchRow value={color} onChange={setColor} />
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
            <Pressable onPress={onClose} style={[styles.modalBtn, { backgroundColor: colors.muted }]}>
              <Text style={{ color: colors.foreground, fontWeight: '600' }}>Cancel</Text>
            </Pressable>
            <Pressable onPress={submit} style={[styles.modalBtn, { backgroundColor: colors.tint }]}>
              <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Add</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Bottom toolbar shared by both editors
// ---------------------------------------------------------------------------
export function ToolbarButton({ icon, label, active, onPress }: { icon: React.ComponentProps<typeof Icon>['name']; label: string; active?: boolean; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={styles.toolBtn} accessibilityRole="button" accessibilityLabel={label}>
      <Icon name={icon} size={24} color={active ? colors.tint : '#FFFFFF'} />
      <Text style={{ fontSize: 11, color: active ? colors.tint : '#FFFFFF', marginTop: 4 }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filmstripRow: { flexDirection: 'row', gap: 16, paddingHorizontal: 16 },
  filmstripItem: { alignItems: 'center' },
  filmstripSwatch: { width: 56, height: 56, borderRadius: 10, borderWidth: 2, overflow: 'hidden' },
  filmstripFill: { flex: 1, backgroundColor: '#8E8E93' },
  sliderTrack: { height: 4, borderRadius: 2, justifyContent: 'center' },
  sliderFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 2 },
  sliderThumb: { position: 'absolute', width: 20, height: 20, borderRadius: 10, top: -8 },
  swatch: { width: 28, height: 28, borderRadius: 14 },
  textLayer: { position: 'absolute' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalCard: { borderRadius: 16, padding: 20 },
  modalInput: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, padding: 12, minHeight: 60, fontSize: 16 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  toolBtn: { alignItems: 'center', flex: 1 },
});
