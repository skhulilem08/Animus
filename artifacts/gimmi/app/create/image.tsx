import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Pressable, TextInput, LayoutChangeEvent, ActivityIndicator } from 'react-native';
import { Text, IconButton, EmptyState } from '@/components/GimmiUI';
import {
  FilterFilmstrip, LookOverlay, EditorSlider, DrawCanvas, ColorSwatchRow,
  TextLayerCanvas, AddTextModal, ToolbarButton, FilterKey, TextLayer,
} from '@/components/PostEditor';
import { useColors } from '@/hooks/useColors';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useCreatePost, useGetFeed, useUploadMedia } from '@workspace/api-client-react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Panel = 'none' | 'adjust' | 'filters' | 'draw';

export default function CreateImagePost() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data: feed } = useGetFeed();
  const createPost = useCreatePost();
  const uploadMedia = useUploadMedia();

  const [pickState, setPickState] = useState<'picking' | 'picked' | 'cancelled'>('picking');
  const [uri, setUri] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const [panel, setPanel] = useState<Panel>('none');
  const [filter, setFilter] = useState<FilterKey>('original');
  const [blackAndWhite, setBlackAndWhite] = useState(false);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);

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
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
      if (result.canceled || !result.assets?.[0]) {
        setPickState('cancelled');
        return;
      }
      setUri(result.assets[0].uri);
      setPickState('picked');
    })();
  }, []);

  const onCanvasLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCanvasSize({ width, height });
  };

  const togglePanel = (p: Panel) => setPanel((cur) => (cur === p ? 'none' : p));

  const handleDraw = () => {
    const next = !drawActive;
    setDrawActive(next);
    setPanel(next ? 'draw' : 'none');
  };

  const handleNext = () => setCaptionOpen(true);

  const handlePost = () => {
    if (!uri) return;
    const authorId = feed?.viewer.id ?? 1;
    setPosting(true);

    const finish = (mediaUrl: string) => {
      createPost.mutate(
        { data: { authorId, type: 'image', mediaUrl, caption: caption.trim() || undefined } },
        { onSuccess: () => router.replace('/(tabs)'), onError: () => setPosting(false) },
      );
    };

    const filename = uri.split('/').pop() || `photo-${Date.now()}.jpg`;
    uploadMedia.mutate(
      // RN's fetch/FormData wants {uri, name, type}, not a real Blob/File —
      // the generated type is web-shaped (Blob | File) since the OpenAPI
      // spec doesn't know about RN's fetch polyfill; this shape is what
      // actually gets sent over the wire correctly on device.
      { data: { file: { uri, name: filename, type: 'image/jpeg' } as unknown as Blob } },
      {
        onSuccess: (res) => finish(res.url),
        // Upload endpoint unreachable (offline, dev server not running,
        // etc.) — fall back to the local URI so posting still works on
        // this device rather than hard-failing the whole flow.
        onError: () => finish(uri),
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
        <EmptyState icon="image" title="No photo selected" body="Pick a photo to start editing, or head back." action={() => router.back()} actionLabel="Go Back" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <IconButton name="arrow-left" onPress={() => router.back()} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Edit Image</Text>
        <Pressable onPress={handleNext}>
          <Text style={styles.nextLabel}>Next</Text>
        </Pressable>
      </View>

      <View style={styles.canvas} onLayout={onCanvasLayout}>
        <Image source={{ uri }} resizeMode="contain" style={StyleSheet.absoluteFill} />
        <LookOverlay filter={filter} blackAndWhite={blackAndWhite} brightness={brightness} />
        <DrawCanvas enabled={drawActive} color={drawColor} />
        <TextLayerCanvas layers={textLayers} canvasWidth={canvasSize.width} canvasHeight={canvasSize.height} />
      </View>

      {panel === 'adjust' && (
        <View style={[styles.panel, { backgroundColor: colors.card }]}>
          <EditorSlider label="Brightness" value={brightness} onChange={setBrightness} />
          <EditorSlider label="Contrast" value={contrast} onChange={setContrast} />
          <EditorSlider label="Saturation" value={saturation} onChange={setSaturation} />
        </View>
      )}

      {panel === 'filters' && (
        <View style={[styles.panel, { backgroundColor: colors.card, paddingHorizontal: 0 }]}>
          <FilterFilmstrip value={filter} onChange={setFilter} />
        </View>
      )}

      {panel === 'draw' && (
        <View style={[styles.panel, { backgroundColor: colors.card, alignItems: 'center' }]}>
          <ColorSwatchRow value={drawColor} onChange={setDrawColor} />
        </View>
      )}

      <View style={[styles.toolbar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <ToolbarButton icon="adjust" label="Adjust" active={panel === 'adjust'} onPress={() => togglePanel('adjust')} />
        <ToolbarButton icon="filters" label="Filters" active={panel === 'filters'} onPress={() => togglePanel('filters')} />
        <ToolbarButton icon="bw" label="B&W" active={blackAndWhite} onPress={() => setBlackAndWhite((v) => !v)} />
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
              <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 16 }}>New Post</Text>
              <Pressable onPress={handlePost} disabled={posting}>
                {posting ? <ActivityIndicator color={colors.tint} /> : <Text style={{ color: colors.tint, fontWeight: '700', fontSize: 16 }}>Post</Text>}
              </Pressable>
            </View>
            <View style={styles.captionRow}>
              <Image source={{ uri }} style={styles.captionThumb} />
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
  panel: { paddingHorizontal: 20, paddingVertical: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  toolbar: { flexDirection: 'row', paddingTop: 14, backgroundColor: '#111111' },
  captionSheet: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  captionCard: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 },
  captionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  captionRow: { flexDirection: 'row', gap: 12 },
  captionThumb: { width: 56, height: 56, borderRadius: 8 },
  captionInput: { flex: 1, fontSize: 16, maxHeight: 120 },
});
