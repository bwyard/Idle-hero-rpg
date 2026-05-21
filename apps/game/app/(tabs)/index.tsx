import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../../src/stores/gameStore';
import { useTickLoop } from '../../src/hooks/useTickLoop';
import { HERO_ACTION_POINT_MAX } from '../../src/data/balance';
import { GuildHeader } from '../../src/components/GuildHeader';
import { HeroCard } from '../../src/components/HeroCard';
import { EventLog } from '../../src/components/EventLog';
import { TickControls } from '../../src/components/TickControls';
import { VisitorCard } from '../../src/components/VisitorCard';
import { ToastStack } from '../../src/components/ToastStack';

export default function GuildScreen() {
  const state = useGameStore((s) => s.state);
  const dispatch = useGameStore((s) => s.dispatch);
  const { isRunning, togglePlayPause, tickOnce } = useTickLoop();

  const visitorList = Object.values(state.transientVisitors);
  const recentEvents = [...state.eventLog].reverse().slice(0, 5);

  const handleHoldVisitor = (visitorId: string) => {
    dispatch({ type: 'HOLD_VISITOR', visitorId } as Parameters<typeof dispatch>[0]);
  };

  const handleServeVisitor = (visitorId: string) => {
    dispatch({ type: 'SERVE_VISITOR', visitorId } as Parameters<typeof dispatch>[0]);
  };

  const handleEngageVisitor = (visitorId: string) => {
    dispatch({ type: 'ENGAGE_VISITOR', visitorId } as Parameters<typeof dispatch>[0]);
  };

  const handleDismissVisitor = (visitorId: string) => {
    dispatch({ type: 'DISMISS_VISITOR', visitorId } as Parameters<typeof dispatch>[0]);
  };

  return (
    <View style={styles.root} testID="guild-screen">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <GuildHeader
          guildName={state.guild.name || 'The Iron Hearth'}
          guildType={state.guild.type}
          prestigeCount={state.dynasty.prestigeCount}
        />

        <HeroCard
          name={state.hero.name || 'Aldric'}
          heroClass={state.hero.heroClass}
          actionPoints={state.hero.actionPoints}
          maxActionPoints={HERO_ACTION_POINT_MAX}
        />

        {visitorList.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visitors ({visitorList.length})</Text>
            {visitorList.map((visitor) => (
              <VisitorCard
                key={visitor.id}
                visitor={visitor}
                currentTick={state.time.ticksElapsed}
                onHold={handleHoldVisitor}
                onServe={handleServeVisitor}
                onEngage={handleEngageVisitor}
                onDismiss={handleDismissVisitor}
              />
            ))}
          </View>
        )}

        <EventLog events={recentEvents} />

        <TickControls
          isRunning={isRunning}
          ticksElapsed={state.time.ticksElapsed}
          onTogglePlayPause={togglePlayPause}
          onTickOnce={tickOnce}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>v{state.version}</Text>
        </View>
      </ScrollView>
      <ToastStack />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
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
  section: {
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
  footer: {
    marginTop: 20,
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#3a2a5e',
  },
  footerText: {
    fontSize: 11,
    color: '#3a2f50',
  },
});
