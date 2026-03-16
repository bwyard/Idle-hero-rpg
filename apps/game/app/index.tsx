/**
 * Demo Dashboard — wires the Zustand gameStore to a live UI.
 *
 * Shows guild header, stats, hero card, adventurer roster, quest board,
 * event log, action buttons, and tick controls. Designed for mobile (Android primary).
 */

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../src/stores/gameStore';
import { useTickLoop } from '../src/hooks/useTickLoop';
import { createId } from '@idle-hero-rpg/shared';
import { HERO_ACTION_POINT_MAX } from '../src/data/balance';
import { GuildHeader } from '../src/components/GuildHeader';
import { StatsBar } from '../src/components/StatsBar';
import { HeroCard } from '../src/components/HeroCard';
import { AdventurerRoster } from '../src/components/AdventurerRoster';
import { QuestBoard } from '../src/components/QuestBoard';
import { AdventurerPicker } from '../src/components/AdventurerPicker';
import { EventLog } from '../src/components/EventLog';
import { ActionButtons } from '../src/components/ActionButtons';
import { TickControls } from '../src/components/TickControls';
import { VisitorCard } from '../src/components/VisitorCard';

export default function DemoScreen() {
  const state = useGameStore((s) => s.state);
  const dispatch = useGameStore((s) => s.dispatch);
  const { isRunning, togglePlayPause, tickOnce } = useTickLoop();

  const [pickerQuestId, setPickerQuestId] = useState<string | null>(null);

  const adventurerList = Object.values(state.adventurers);
  const visitorList = Object.values(state.transientVisitors);
  const questList = Object.values(state.quests);
  const recentEvents = [...state.eventLog].reverse().slice(0, 5);

  const handleAction = (actionType: string) => {
    switch (actionType) {
      case 'GENERATE_QUESTS':
        dispatch({ type: 'GENERATE_QUESTS' });
        break;
      case 'BUILD_BUILDING': {
        const firstCityId = Object.keys(state.cities)[0];
        if (firstCityId) {
          dispatch({
            type: 'BUILD_BUILDING',
            buildingTemplateId: 'training-grounds',
            cityId: firstCityId,
          });
        }
        break;
      }
      case 'UPGRADE_BUILDING': {
        const firstBuildingId = Object.keys(state.buildings)[0];
        if (firstBuildingId) {
          dispatch({ type: 'UPGRADE_BUILDING', buildingId: firstBuildingId });
        }
        break;
      }
      case 'EXPAND_CITY':
        dispatch({ type: 'EXPAND_CITY', cityId: createId('cty'), cityName: 'New Settlement' });
        break;
      default:
        dispatch({ type: actionType } as Parameters<typeof dispatch>[0]);
    }
  };

  const handleAssignQuest = (questId: string) => {
    setPickerQuestId(questId);
  };

  const handlePickAdventurer = (questId: string, adventurerId: string) => {
    dispatch({ type: 'START_QUEST', questId, adventurerId });
    setPickerQuestId(null);
  };

  const handleHoldVisitor = (visitorId: string) => {
    dispatch({ type: 'HOLD_VISITOR', visitorId } as Parameters<typeof dispatch>[0]);
  };

  const handleEngageVisitor = (visitorId: string) => {
    dispatch({ type: 'ENGAGE_VISITOR', visitorId } as Parameters<typeof dispatch>[0]);
  };

  const handleDismissVisitor = (visitorId: string) => {
    dispatch({ type: 'DISMISS_VISITOR', visitorId } as Parameters<typeof dispatch>[0]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <GuildHeader
        guildName={state.guild.name || 'The Iron Hearth'}
        guildType={state.guild.type}
        prestigeCount={state.dynasty.prestigeCount}
      />

      <StatsBar
        currentYear={state.time.currentYear}
        gold={state.guild.gold}
        reputation={state.guild.reputation}
        adventurerCount={adventurerList.length}
        currentDay={state.time.currentDay}
        currentSeason={state.time.currentSeason}
      />

      <HeroCard
        name={state.hero.name || 'Aldric'}
        heroClass={state.hero.heroClass}
        actionPoints={state.hero.actionPoints}
        maxActionPoints={HERO_ACTION_POINT_MAX}
      />

      <AdventurerRoster adventurers={adventurerList} />

      <QuestBoard quests={questList} onAssignQuest={handleAssignQuest} />

      <AdventurerPicker
        visible={pickerQuestId !== null}
        questId={pickerQuestId}
        adventurers={adventurerList}
        activeQuests={questList}
        onSelect={handlePickAdventurer}
        onClose={() => setPickerQuestId(null)}
      />

      <View style={styles.visitorsSection}>
        <Text style={styles.sectionTitle}>Visitors ({visitorList.length})</Text>
        {visitorList.length === 0 ? (
          <Text style={styles.placeholderText}>No visitors at the guild house</Text>
        ) : (
          visitorList.map((visitor) => (
            <VisitorCard
              key={visitor.id}
              visitor={visitor}
              currentTick={state.time.ticksElapsed}
              onHold={handleHoldVisitor}
              onEngage={handleEngageVisitor}
              onDismiss={handleDismissVisitor}
            />
          ))
        )}
      </View>

      <EventLog events={recentEvents} />

      <ActionButtons onAction={handleAction} />

      <TickControls
        isRunning={isRunning}
        ticksElapsed={state.time.ticksElapsed}
        onTogglePlayPause={togglePlayPause}
        onTickOnce={tickOnce}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Engine: 13-system tick pipe | v{state.version}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#140a24',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  visitorsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#b0a090',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 14,
    color: '#8a7a6a',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#3a2a5e',
  },
  footerText: {
    fontSize: 13,
    color: '#8a7a6a',
  },
});
