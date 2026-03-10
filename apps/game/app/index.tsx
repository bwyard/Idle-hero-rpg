import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Retired Hero's Guild</Text>
      <Text style={styles.subtitle}>Your legend begins here...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#c9b14a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a09070',
  },
});
