import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Text, Screen, Header, SearchField, Avatar, CommunityPill, LoadingState, ErrorState, EmptyState, SectionLabel, Icon } from '@/components/GimmiUI';
import { useGetDiscover } from '@workspace/api-client-react';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';

export default function Discover() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Communities');
  const { data, isLoading, isError, refetch } = useGetDiscover({ query });
  const colors = useColors();

  const TABS = ['Communities', 'People', 'Live Now', 'Topics'];
  
  // Sort communities to prioritize Ladybug and Cat
  const communities = [...(data?.communities || [])].sort((a, b) => {
    if (a.name === 'Ladybug Community') return -1;
    if (b.name === 'Ladybug Community') return 1;
    if (a.name === 'Cat Community') return -1;
    if (b.name === 'Cat Community') return 1;
    return a.name.localeCompare(b.name);
  });

  if (isLoading) return <Screen><Header title="Discover" showBorder={false} /><View style={{ paddingHorizontal: 16 }}><SearchField value={query} onChangeText={setQuery} /></View><LoadingState label="Searching..." /></Screen>;
  if (isError) return <Screen><Header title="Discover" showBorder={false} /><View style={{ paddingHorizontal: 16 }}><SearchField value={query} onChangeText={setQuery} /></View><ErrorState onRetry={refetch} /></Screen>;

  return (
    <Screen useSafeArea={false}>
      <View style={{ height: 44 }} />
      <Header title="Discover" showBorder={false} />
      <View style={{ paddingHorizontal: 16 }}>
        <SearchField value={query} onChangeText={setQuery} />
      </View>

      <View style={{ marginBottom: 24, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 24, paddingHorizontal: 16 }}>
          {TABS.map((tab) => (
            <Pressable key={tab} onPress={() => setActiveTab(tab)}>
              <Text style={{ 
                fontSize: 15, 
                fontWeight: activeTab === tab ? '600' : '400',
                color: activeTab === tab ? colors.foreground : colors.mutedForeground,
                paddingBottom: 12,
                borderBottomWidth: 2,
                borderColor: activeTab === tab ? colors.foreground : 'transparent'
              }}>{tab}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {!data || (communities.length === 0 && data.people.length === 0) ? (
        <EmptyState icon="search" title="No results" body="Try searching for something else." />
      ) : (
        <View style={{ paddingHorizontal: 16 }}>
          {communities.length > 0 && (
            <View style={{ marginBottom: 32 }}>
              <SectionLabel action="See all">Communities</SectionLabel>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
                {communities.map((c) => (
                  <Pressable key={c.id} style={[styles.communityCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push(`/community/${c.id}`)}>
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.color, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>{c.name[0]}</Text>
                    </View>
                    <Text style={[styles.cName, { color: colors.foreground }]} numberOfLines={1}>{c.name}</Text>
                    <Text style={[styles.cMembers, { color: colors.mutedForeground }]}>{c.memberCount.toLocaleString()} members</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {data.people.length > 0 && (
            <View style={{ marginBottom: 32 }}>
              <SectionLabel action="See all">People</SectionLabel>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingRight: 16 }} style={{ marginHorizontal: -16, paddingHorizontal: 16 }}>
                {data.people.map((p) => (
                  <Pressable key={p.id} style={styles.personCard} onPress={() => router.push(`/profile/${p.id}`)}>
                    <Avatar author={p} size={64} />
                    <Text style={[styles.pName, { color: colors.foreground }]} numberOfLines={1}>{p.displayName}</Text>
                    <CommunityPill name={p.communityName} color={p.communityColor} />
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
          
          <View style={{ marginBottom: 32 }}>
            <SectionLabel action="See all">Topics</SectionLabel>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {data.topics.map((t, i) => (
                <View key={i} style={[styles.topicPill, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.topicText, { color: colors.foreground }]}>#{t}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  communityCard: { width: '48%', padding: 16, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
  cName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cMembers: { fontSize: 13 },
  personCard: { alignItems: 'center', width: 88, gap: 8 },
  pName: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  topicPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  topicText: { fontSize: 15, fontWeight: '500' },
});