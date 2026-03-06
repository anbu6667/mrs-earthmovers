import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  useWindowDimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { PREMIUM_LIGHT } from '../../styles/tokens';
import Entrance from '../../components/Entrance';
import AnimatedPressable from '../../components/AnimatedPressable';

const BRAND = PREMIUM_LIGHT;

const FEATURES = [
  {
    title: 'Real-time Tracking',
    subtitle: 'Live GPS updates every 30 seconds',
    icon: 'flash-on',
  },
  {
    title: 'Secure & Reliable',
    subtitle: 'Enterprise-grade security',
    icon: 'shield',
  },
  {
    title: '24/7 Monitoring',
    subtitle: 'Round-the-clock fleet oversight',
    icon: 'schedule',
  },
  {
    title: 'Anywhere Access',
    subtitle: 'Mobile-first responsive design',
    icon: 'public',
  },
];

export default function LandingScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scale = useMemo(() => {
    // tuned for a close match across small → large phones
    const base = Math.min(width, 420);
    return Math.max(0.9, Math.min(1.04, base / 390));
  }, [width]);

  const heroTitleSize = Math.round(46 * scale);
  const heroLineHeight = Math.round(heroTitleSize * 1.08);

  const backgroundSource = require('../../../assets/landing-bg.png');
  const sidePadding = Math.round(18 * scale);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <ImageBackground
        source={backgroundSource}
        style={styles.bg}
        imageStyle={{ resizeMode: 'cover' }}
      >
        {/* Light base + soft overlay to keep bg image subtle */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={[StyleSheet.absoluteFill, { backgroundColor: BRAND.bg }]} />
          {/* White wash to avoid dark look from the image */}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: 'rgba(255,255,255,0.78)',
              },
            ]}
          />
          {/* Top glow */}
          <View
            style={{
              position: 'absolute',
              left: -80,
              top: -120,
              width: 320,
              height: 320,
              borderRadius: 999,
              backgroundColor: BRAND.accentSoft,
              opacity: 0.9,
            }}
          />
          {/* Bottom glow */}
          <View
            style={{
              position: 'absolute',
              right: -120,
              bottom: -160,
              width: 380,
              height: 380,
              borderRadius: 999,
              backgroundColor: BRAND.accentSoft,
              opacity: 0.7,
            }}
          />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.container,
            {
              paddingHorizontal: sidePadding,
              paddingTop: Math.max(10, Math.round(10 * scale)),
              paddingBottom: Math.max(24, insets.bottom + 20),
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Entrance>
            <View style={[styles.section, styles.brandRow]}>
              <View style={styles.brandIconWrap}>
                <View style={styles.brandIcon}>
                  <MaterialIcons name="local-shipping" size={22} color={BRAND.accent} />
                </View>
                <View style={styles.brandDot} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.brandTop, { fontSize: Math.round(20 * scale) }]}>MRS</Text>
                <Text style={[styles.brandBottom, { fontSize: Math.round(20 * scale) }]}>Earthmovers</Text>
              </View>
            </View>
          </Entrance>

          {/* Hero */}
          <Entrance delay={80}>
            <View style={[styles.section, { marginTop: Math.round(26 * scale) }]}>
              <Text style={[styles.hero, { fontSize: heroTitleSize, lineHeight: heroLineHeight }]}>
                Powering Progress,
              </Text>
              <Text style={[styles.hero, { fontSize: heroTitleSize, lineHeight: heroLineHeight, color: BRAND.accent }]}>
                Moving Earth.
              </Text>

              <Text
                style={[
                  styles.lead,
                  {
                    marginTop: Math.round(18 * scale),
                    fontSize: Math.round(15 * scale),
                    lineHeight: Math.round(22 * scale),
                  },
                ]}
              >
                Complete fleet management solution with real-time GPS tracking, instant notifications, and
                comprehensive job documentation.
              </Text>
            </View>
          </Entrance>

          {/* Feature cards */}
          <View style={[styles.sectionWide, styles.cardsGrid, { marginTop: Math.round(22 * scale) }]}>
            {FEATURES.map((f, idx) => (
              <Entrance key={f.title} delay={120 + idx * 60} style={styles.featureTile}>
                <View style={styles.featureCard}>
                  <View style={styles.featureCardInner}>
                    <View style={styles.featureIcon}>
                      <MaterialIcons name={f.icon} size={18} color={BRAND.accent} />
                    </View>
                    <Text style={styles.featureTitle} numberOfLines={2}>
                      {f.title}
                    </Text>
                    <Text style={styles.featureSub} numberOfLines={2}>
                      {f.subtitle}
                    </Text>
                  </View>
                </View>
              </Entrance>
            ))}
          </View>

          {/* Stats */}
          <Entrance delay={380}>
            <View style={[styles.section, styles.statsRow, { marginTop: Math.round(18 * scale) }]}>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { fontSize: Math.round(30 * scale) }]}>500+</Text>
                <Text style={styles.statLabel}>Jobs Completed</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { fontSize: Math.round(30 * scale) }]}>50+</Text>
                <Text style={styles.statLabel}>Active Drivers</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { fontSize: Math.round(30 * scale) }]}>99.9%</Text>
                <Text style={styles.statLabel}>Uptime</Text>
              </View>
            </View>
          </Entrance>

          {/* CTA */}
          <View style={[styles.section, styles.ctaWrap]}>
            <Entrance delay={460}>
              <AnimatedPressable onPress={() => navigation.replace('Login')}>
                <View style={[styles.cta, { paddingVertical: Math.round(14 * scale) }]}>
                  <Text style={[styles.ctaText, { fontSize: Math.round(16 * scale), marginRight: 10 }]}>
                    Continue
                  </Text>
                  <MaterialIcons name="arrow-forward" size={20} color={BRAND.text} />
                </View>
              </AnimatedPressable>
            </Entrance>
          </View>

          {/* Extra breathing room for gesture bar */}
          <View style={{ height: Platform.OS === 'android' ? Math.max(8, Math.round(height * 0.01)) : 8 }} />
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BRAND.bg,
  },
  bg: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: 'stretch',
  },
  section: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  sectionWide: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  brandIconWrap: {
    position: 'relative',
  },
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: BRAND.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(255,138,0,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BRAND.success,
    borderWidth: 2,
    borderColor: BRAND.bg,
  },
  brandTop: {
    color: BRAND.accent,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  brandBottom: {
    color: BRAND.text,
    fontWeight: '900',
    letterSpacing: 0.2,
    marginTop: -2,
  },
  hero: {
    color: BRAND.text,
    fontWeight: '900',
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  lead: {
    color: BRAND.muted,
    lineHeight: 24,
    maxWidth: 520,
    textAlign: 'center',
    alignSelf: 'center',
    paddingHorizontal: 4,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureTile: {
    flexBasis: '48%',
    maxWidth: '48%',
    marginBottom: 12,
  },
  featureCard: {
    // Outline-only premium look (no solid fill)
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderWidth: 2,
    borderColor: 'rgba(245, 124, 0, 0.62)',
    borderRadius: 20,
    overflow: 'hidden',
    // no shadow/glow (clean outline as requested)
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  featureCardInner: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    minHeight: 116,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: BRAND.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,138,0,0.18)',
  },
  featureTitle: {
    marginTop: 10,
    color: BRAND.text,
    fontWeight: '900',
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
  },
  featureSub: {
    marginTop: 4,
    color: BRAND.muted,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 10,
  },
  stat: {
    flexBasis: '33%',
    minWidth: 96,
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  statValue: {
    color: BRAND.accent,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  statLabel: {
    color: BRAND.muted,
    marginTop: 2,
    fontSize: 12,
    textAlign: 'center',
  },
  ctaWrap: {
    marginTop: 18,
  },
  cta: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: BRAND.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  ctaText: {
    color: BRAND.text,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});
