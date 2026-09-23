import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, TextInput, LayoutChangeEvent, ActivityIndicator } from 'react-native';
import { Text, IconButton, EmptyState } from '@/components/GimmiUI';
import {
  FilterFilmstrip, LookOverlay, DrawCanvas, ColorSwatchRow,
  TextLayerCanvas, AddTextModal, ToolbarButton, FilterKey, TextLayer,
} from '@/components/PostEditor';
import { useColors } from '@/hooks/useColors';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCreatePost, useGetFeed } from '@workspace/api-client-react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Panel = 'none' | 'draw';

function formatTime(seconds: number) {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function CreateVideoPost() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data: feed } = useGetFeed();
  const createPost = useCreatePost();

  const [pickState, setPickState] = useState<'picking' | 'picked' | 'cancelled'>('picking');
  const [uri, setUri] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const player = useVideoPlayer(uri ?? null, (p) => {
    p.loop = true;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!player) return;
    const interval = setInterval(() => {
      setTime(player.currentTime ?? 0);
      setDuration(player.duration ?? 0);
      setIsPlaying(player.playing ?? false);
    }, 250);
    return () => clearInterval(interval);
  }, [player]);

  const [panel, setPanel] = useState<Panel>('none');
  const [filter, setFilter] = useState<FilterKey>('original');
  const [drawActive, setDrawActive] = useState(false);
  const [drawColor, setDrawColor] = useState('#FFFFFF');

  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [textModalOpen, setTextModalOpen] = useState(false);

  const [captionOpen, setCaptionOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    (async () => {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setPickState('cancelled');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], quality: 0.9 });
      if (result.canceled || !result.assets?.[0]) {
        setPickState('cancelled');
        return;
      }
      setUri(result.assets[0].uri);
      setPickState('picked');
    })();
  }, []);

  const onCanvasLayout = (e: LayoutChangeEvent) => setCanvasSize(e.nativeEvent.layout);

  const togglePlay = () => {
    if (!player) return;
    if (player.playing) player.pause();
    else player.play();
  };

  const handleDraw = () => {
    const next = !drawActive;
    setDrawActive(next);
    setPanel(next ? 'draw' : 'none');
  };

  const handleNext = () => {
    player?.pause();
    setCaptionOpen(true);
  };

  const handlePost = () => {
    if (!uri) return;
    const authorId = feed?.viewer.id ?? 1;
    setPosting(true);
    createPost.mutate(
      // Same caveat as the image editor: mediaUrl is the local picked file —
      // no upload endpoint exists yet, and filters/draw/text here are
      // preview-only, not baked into the file. See PostEditor.tsx.
      { data: { authorId, type: 'video', mediaUrl: uri, caption: caption.trim() || undefined } },
      {
        onSuccess: () => router.replace('/(tabs)'),
        onError: () => setPosting(false),
      },
    );
  };

  if (pickState === 'picking') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FFFFFF" />
      </View>
    );
  }

  if (pickState === 'cancelled' || !uri) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <EmptyState icon="video" title="No video selected" body="Pick a video to start editing, or head back." action={() => router.back()} actionLabel="Go Back" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <IconButton name="arrow-left" onPress={() => router.back()} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Edit Video</Text>
        <Pressable onPress={handleNext}>
          <Text style={styles.nextLabel}>Next</Text>
        </Pressable>
      </View>

      <Pressable style={styles.canvas} onLayout={onCanvasLayout} onPress={togglePlay}>
        <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="contain" nativeControls={false} />
        <LookOverlay filter={filter} blackAndWhite={false} brightness={0} />
        <DrawCanvas enabled={drawActive} color={drawColor} />
        <TextLayerCanvas layers={textLayers} canvasWidth={canvasSize.width} canvasHeight={canvasSize.height} />

        {!isPlaying && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={styles.playOverlay}>
              <View style={styles.playCircle}>
                <View style={styles.playTriangle} />
              </View>
            </View>
          </View>
        )}

        <Text style={styles.timeLabel}>{formatTime(time)} / {formatTime(duration)}</Text>
      </Pressable>

      <View style={[styles.panel, { backgroundColor: colors.card, paddingHorizontal: 0 }]}>
        <FilterFilmstrip value={filter} onChange={setFilter} />
      </View>

      {panel === 'draw' && (
        <View style={[styles.panel, { backgroundColor: colors.card, alignItems: 'center' }]}>
          <ColorSwatchRow value={drawColor} onChange={setDrawColor} />
        </View>
      )}

      <View style={[styles.toolbar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <ToolbarButton icon="filters" label="Filters" active={false} onPress={() => {}} />
        <ToolbarButton icon="pen-tool" label="Draw" active={drawActive} onPress={handleDraw} />
        <ToolbarButton icon="text" label="Text" active={textModalOpen} onPress={() => setTextModalOpen(true)} />
      </View>

      <AddTextModal
        visible={textModalOpen}
        onClose={() => setTextModalOpen(false)}
        onSubmit={(text, color) => setTextLayers((prev) => [...prev, { id: String(Date.now()), text, color }])}
      />

      {captionOpen && (
        <View style={styles.captionSheet}>
          <View style={[styles.captionCard, { backgroundColor: colors.card, paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.captionHeader}>
              <Pressable onPress={() => setCaptionOpen(false)}><Text style={{ color: colors.mutedForeground, fontSize: 16 }}>Cancel</Text></Pressable>
              <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 16 }}>New Clip</Text>
              <Pressable onPress={handlePost} disabled={posting}>
                {posting ? <ActivityIndicator color={colors.tint} /> : <Text style={{ color: colors.tint, fontWeight: '700', fontSize: 16 }}>Post</Text>}
              </Pressable>
            </View>
            <TextInput
              autoFocus
              multiline
              placeholder="Write a caption…"
              placeholderTextColor={colors.mutedForeground}
              value={caption}
              onChangeText={setCaption}
              maxLength={500}
              style={[styles.captionInput, { color: colors.foreground }]}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  headerTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
  nextLabel: { color: '#0A84FF', fontSize: 17, fontWeight: '600' },
  canvas: { flex: 1, overflow: 'hidden' },
  playOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  playCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  playTriangle: {
    width: 0, height: 0, marginLeft: 4,
    borderTopWidth: 14, borderBottomWidth: 14, borderLeftWidth: 22,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#000000',
  },
  timeLabel: { position: 'absolute', left: 12, bottom: 12, color: '#FFFFFF', fontSize: 13, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4 },
  panel: { paddingHorizontal: 20, paddingVertical: 16 },
  toolbar: { flexDirection: 'row', paddingTop: 14, backgroundColor: '#111111' },
  captionSheet: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  captionCard: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 },
  captionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  captionInput: { fontSize: 16, minHeight: 60, maxHeight: 120 },
});
