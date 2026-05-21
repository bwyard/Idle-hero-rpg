import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../../src/stores/gameStore';
import { createId } from '@idle-hero-rpg/shared';
import { BUILDING_TEMPLATES } from '../../src/data/buildingTemplates';

export default function HallScreen() {
  const state = useGameStore((s) => s.state);
  const dispatch = useGameStore((s) => s.dispatch);

  const buildingList = Object.values(state.buildings);
  const firstCityId = Object.keys(state.cities)[0] ?? null;
  const firstBuildingId = buildingList[0]?.id ?? null;

  const handleBuild = () => {
    if (firstCityId) {
      dispatch({
        type: 'BUILD_BUILDING',
        buildingTemplateId: 'training-grounds',
        cityId: firstCityId,
      });
    }
  };

  const handleUpgrade = () => {
    if (firstBuildingId) {
      dispatch({ type: 'UPGRADE_BUILDING', buildingId: firstBuildingId });
    }
  };

  const handleExpandCity = () => {
    dispatch({ type: 'EXPAND_CITY', cityId: createId('cty'), cityName: 'New Settlement' });
  };

  return (
    <View style={styles.root} testID="hall-screen">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section} testID="buildings-section">
          <Text style={styles.sectionTitle}>Buildings</Text>
          {buildingList.length === 0 ? (
            <Text style={styles.placeholder}>No buildings yet — build your first</Text>
          ) : (
            buildingList.map((building) => {
              const template = BUILDING_TEMPLATES[building.templateId];
              return (
                <View key={building.id} style={styles.buildingRow}>
                  <View style={styles.buildingInfo}>
                    <Text style={styles.buildingName}>{template?.name ?? building.templateId}</Text>
                    <Text style={styles.buildingLevel}>Level {building.level}</Text>
                  </View>
                  <Text style={styles.buildingIncome}>
                    {(template?.baseIncomePerLevel ?? 0) * building.level > 0
                      ? `+${String((template?.baseIncomePerLevel ?? 0) * building.level)}g/tick`
                      : '—'}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
            onPress={handleBuild}
            accessibilityRole="button"
            accessibilityLabel="Build training grounds"
          >
            {({ pressed }) => (
              <Text style={[styles.actionBtnText, pressed && styles.actionBtnTextPressed]}>
                Build (100g)
              </Text>
            )}
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
            onPress={handleUpgrade}
            accessibilityRole="button"
            accessibilityLabel="Upgrade building"
          >
            {({ pressed }) => (
              <Text style={[styles.actionBtnText, pressed && styles.actionBtnTextPressed]}>
                Upgrade
              </Text>
            )}
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
            onPress={handleExpandCity}
            accessibilityRole="button"
            accessibilityLabel="Expand city"
          >
            {({ pressed }) => (
              <Text style={[styles.actionBtnText, pressed && styles.actionBtnTextPressed]}>
                Expand City
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#140a24',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#b0a090',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  placeholder: {
    fontSize: 14,
    color: '#8a7a6a',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  buildingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#241445',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a2a5e',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  buildingInfo: {
    flex: 1,
  },
  buildingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f0e8d8',
  },
  buildingLevel: {
    fontSize: 13,
    color: '#b0a090',
    marginTop: 2,
  },
  buildingIncome: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f0d060',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionBtn: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: '#352050',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#f0d060',
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 48,
  },
  actionBtnPressed: {
    backgroundColor: '#f0d060',
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f0d060',
  },
  actionBtnTextPressed: {
    color: '#1a0a2e',
  },
});
