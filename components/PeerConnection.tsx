import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface PeerConnectionProps {
  isConnected: boolean;
  opponentName: string;
  latency: number;
}

export default function PeerConnection({ isConnected, opponentName, latency }: PeerConnectionProps) {
  const [pulseAnim] = React.useState(new Animated.Value(1));
  const [connectionStrength, setConnectionStrength] = React.useState(0);

  React.useEffect(() => {
    // Simulate connection strength
    const interval = setInterval(() => {
      setConnectionStrength(Math.random() * 100);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    // Pulse animation when connected
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    if (isConnected) {
      pulse.start();
    } else {
      pulse.stop();
      pulseAnim.setValue(1);
    }
  }, [isConnected]);

  const getConnectionColor = () => {
    if (connectionStrength > 70) return '#10b981';
    if (connectionStrength > 40) return '#f59e0b';
    return '#ef4444';
  };

  const getConnectionText = () => {
    if (!isConnected) return 'Connecting...';
    if (connectionStrength > 70) return 'Excellent';
    if (connectionStrength > 40) return 'Good';
    return 'Poor';
  };

  return (
    <View style={styles.container}>
      <View style={styles.connectionHeader}>
        <Text style={styles.connectionTitle}>Peer-to-Peer Connection</Text>
        <View style={styles.connectionStatus}>
          <Animated.View 
            style={[
              styles.connectionDot, 
              { 
                backgroundColor: isConnected ? getConnectionColor() : '#64748b',
                transform: [{ scale: pulseAnim }]
              }
            ]} 
          />
          <Text style={[styles.statusText, { color: getConnectionColor() }]}>
            {getConnectionText()}
          </Text>
        </View>
      </View>

      <View style={styles.connectionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Opponent:</Text>
          <Text style={styles.detailValue}>{opponentName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Latency:</Text>
          <Text style={styles.detailValue}>{latency}ms</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Signal:</Text>
          <View style={styles.signalBar}>
            <View style={[styles.signalFill, { width: `${connectionStrength}%`, backgroundColor: getConnectionColor() }]} />
          </View>
        </View>
      </View>

      <View style={styles.realtimeIndicator}>
        <Text style={styles.realtimeText}>🔴 Real-time Battle Active</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  connectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  connectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  connectionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  signalBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginLeft: 8,
    maxWidth: 100,
  },
  signalFill: {
    height: '100%',
    borderRadius: 3,
  },
  realtimeIndicator: {
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  realtimeText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
});
