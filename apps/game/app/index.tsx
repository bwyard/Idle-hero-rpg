/**
 * Demo Dashboard — wires the Zustand gameStore to a live UI.
 *
 * Shows guild header, stats, hero card, adventurer roster, event log,
 * action buttons, and tick controls. Designed for mobile (Android primary).
 */

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../src/stores/gameStore';
import { useTickLoop } from '../src/hooks/useTickLoop';
import { HERO_ACTION_POINT_MAX, TICKS_PER_YEAR } from '../src/data/balance';
import { GuildHeader } from '../src/components/GuildHeader';
import { StatsBar } from '../src/components/StatsBar';
import { HeroCard } from '../src/components/HeroCard';
import { AdventurerRoster } from '../src/components/AdventurerRoster';
import { EventLog } from '../src/components/EventLog';
import { ActionButtons } from '../src/components/ActionButtons';
import { TickControls } from '../src/components/TickControls';

/** Demo action types — cast through dispatch until the other agent adds proper types. */
interface DemoAction {
  readonly type: string;
}

export default function DemoScreen() {
  const state = useGameStore((s) => s.state);
  const dispatch = useGameStore((s) => s.dispatch);
  const { isRunning, togglePlayPause, tickOnce } = useTickLoop();

  const adventurerList = Object.values(state.adventurers);
  const recentEvents = [...state.eventLog].reverse().slice(0, 5);

  const handleAction = (actionType: string) => {
    dispatch({ type: actionType } as unknown as DemoAction as Parameters<typeof dispatch>[0]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
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
        ticksElapsed={state.time.ticksElapsed}
        ticksPerYear={TICKS_PER_YEAR}
      />

      <HeroCard
        name={state.hero.name || 'Aldric'}
        heroClass={state.hero.heroClass}
        actionPoints={state.hero.actionPoints}
        maxActionPoints={HERO_ACTION_POINT_MAX}
      />

      <AdventurerRoster adventurers={adventurerList} />

      <EventLog events={recentEvents} />

      <ActionButtons onAction={handleAction} />

      <TickControls
        isRunning={isRunning}
        ticksElapsed={state.time.ticksElapsed}
        onTogglePlayPause={togglePlayPause}
        onTickOnce={tickOnce}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Engine: 12-system tick pipe | v{state.version}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0a2e',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#a09070',
  },
});
