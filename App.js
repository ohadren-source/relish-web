import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Image, Linking } from 'react-native';

// ============================================================================
// BACKEND URL (Only this - no API keys in app!)
// ============================================================================

const BACKEND_URL = 'https://sauc-e-backend-production.up.railway.app';

const FREE_WISDOM_LIMIT = 9;

// Payment & external links
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/28E00l3HOg638gA6hxa3u00';
const SAUCE_HOME = 'https://sauc-e.com';
const CHECKOUT_URL = 'https://sauc-e.com/checkitout';

// ============================================================================
// IMAGES
// ============================================================================

const relishLogo = require('./assets/icon.png');
const peakFlavour = require('./assets/relish_peak_pacakage.png');
const usVsThem = require('./assets/relish_uvt.png');

const RELISH = () => {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [wisdomCount, setWisdomCount] = useState(0);
  const [situation, setSituation] = useState('');
  const [context, setContext] = useState('Life');
  const [wisdom, setWisdom] = useState('');
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState(null);

  const freeLeft = Math.max(0, FREE_WISDOM_LIMIT - wisdomCount);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  useEffect(() => {
    syncUsageCount('web-user');
  }, []);

  async function syncUsageCount(cid) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/relish/usage-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: cid || 'anonymous' })
      });
      if (response.ok) {
        const data = await response.json();
        setWisdomCount(data.usageCount || 0);
      }
    } catch (error) {
      console.log('Usage sync skipped:', error.message);
    }
  }

  // ============================================================================
  // GET WISDOM (Calls backend, NOT Claude directly)
  // ============================================================================
  
  async function handleGetWisdom() {
    if (!situation.trim()) {
      window.alert('Please describe your situation');
      return;
    }

    // If free limit reached, redirect to payment
    if (!isSubscribed && wisdomCount >= FREE_WISDOM_LIMIT) {
      window.open(STRIPE_PAYMENT_LINK, '_blank');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/relish/get-wisdom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerId || 'anonymous',
          situation: situation,
          context: context
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 403) {
          window.open(STRIPE_PAYMENT_LINK, '_blank');
          return;
        }
        
        throw new Error(errorData.error || 'Failed to get wisdom');
      }

      const data = await response.json();
      setWisdom(data.wisdom);
      setWisdomCount(wisdomCount + 1);
      setSituation('');
      
    } catch (error) {
      window.alert(error.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <ScrollView style={styles.container}>

      {/* ===== HEADER - sauc-e.com branding ===== */}
      <View style={styles.sauceHeader}>
        <TouchableOpacity onPress={() => window.open(SAUCE_HOME, '_blank')}>
          <Text style={styles.sauceLogoText}>
            <Text style={styles.sauceName}>sauc-e</Text>
            <Text style={styles.sauceTagline}> where HOME is the </Text>
            <Text style={styles.sauceHeart}>❤️</Text>
          </Text>
        </TouchableOpacity>
        <View style={styles.sauceNav}>
          <TouchableOpacity onPress={() => window.open(CHECKOUT_URL, '_blank')}>
            <Text style={styles.sauceNavLink}>Check It Out Y'all</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => window.open(SAUCE_HOME + '/about', '_blank')}>
            <Text style={styles.sauceNavLink}>About</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => window.open(SAUCE_HOME + '/contact', '_blank')}>
            <Text style={styles.sauceNavLink}>Contact</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ===== RELISH LOGO + TITLE ===== */}
      <View style={styles.header}>
        <Image source={relishLogo} style={styles.relishLogoImage} resizeMode="contain" />
        <Text style={styles.title}>RELISH</Text>
        <Text style={styles.subtitle}>Wisdom & Clarity</Text>
        <Text style={styles.philosophy}>Understanding = Quality / Quantity</Text>
      </View>

      {/* ===== PREMIUM COUNTER ===== */}
      {!isSubscribed && (
        <View style={styles.premiumSection}>
          <TouchableOpacity 
            style={[styles.premiumPill, freeLeft === 0 && styles.premiumPillUrgent]}
            onPress={() => window.open(STRIPE_PAYMENT_LINK, '_blank')}
          >
            <Text style={styles.premiumPillText}>
              {freeLeft > 0 
                ? `Premium · ${freeLeft} free left` 
                : 'Upgrade to Premium · $9.99/mo'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ===== APP FUNCTIONALITY ===== */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Pick a Context</Text>
        
        {['Life', 'Career', 'Relationships', 'Health', 'Money'].map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.contextButton, context === c && styles.contextButtonActive]}
            onPress={() => setContext(c)}
          >
            <Text style={styles.contextText}>{c}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Your Situation</Text>
        <TextInput
          style={styles.input}
          placeholder="Describe what's on your mind..."
          placeholderTextColor="#999"
          value={situation}
          onChangeText={setSituation}
          multiline
        />

        <TouchableOpacity
          style={[styles.wisdomButton, loading && styles.wisdomButtonDisabled]}
          onPress={handleGetWisdom}
          disabled={loading}
        >
          <Text style={styles.wisdomButtonText}>
            {loading ? 'Seeking wisdom...' : 'Get Wisdom'}
          </Text>
        </TouchableOpacity>

        {wisdom && (
          <View style={styles.wisdomBox}>
            <Text style={styles.wisdomTitle}>Wisdom</Text>
            <Text style={styles.wisdomText}>{wisdom}</Text>
          </View>
        )}
      </View>

      {/* ===== US vs THEM ===== */}
      <View style={styles.marketingSection}>
        <Image source={usVsThem} style={styles.usVsThemImage} resizeMode="contain" />
      </View>

      {/* ===== PEAK FLAVOUR ===== */}
      <View style={styles.marketingSection}>
        <Image source={peakFlavour} style={styles.peakFlavourImage} resizeMode="contain" />
      </View>

      {/* ===== SUBSCRIBE CTA ===== */}
      {!isSubscribed && (
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Peak Flavour Premium</Text>
          <Text style={styles.ctaSubtitle}>Unlimited wisdom. $9.99/month.</Text>
          <Text style={styles.ctaHotdog}>$9.99 &lt; 3 hot dogs + tax</Text>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => window.open(STRIPE_PAYMENT_LINK, '_blank')}
          >
            <Text style={styles.ctaButtonText}>Subscribe at sauc-e.com</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ===== LEGAL ===== */}
      <View style={styles.legalSection}>
        <TouchableOpacity onPress={() => window.open(SAUCE_HOME + '/terms', '_blank')}>
          <Text style={styles.legalLink}>Terms of Service</Text>
        </TouchableOpacity>
        <Text style={styles.legalSeparator}>  ·  </Text>
        <TouchableOpacity onPress={() => window.open('https://docs.google.com/document/d/1AxzEmZn2AjEY7ry6HSM1S6mlB3ggs0SN', '_blank')}>
          <Text style={styles.legalLink}>Privacy Policy</Text>
        </TouchableOpacity>
        <Text style={styles.legalSeparator}>  ·  </Text>
        <TouchableOpacity onPress={() => window.open(SAUCE_HOME + '/support', '_blank')}>
          <Text style={styles.legalLink}>Support</Text>
        </TouchableOpacity>
      </View>

      {/* ===== FOOTER ===== */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => window.open(SAUCE_HOME, '_blank')}>
          <Text style={styles.footerBrand}>sauc-e.com</Text>
        </TouchableOpacity>
        <Text style={styles.footerTagline}>HOME of all of our delicious APPS</Text>
        <Text style={styles.footerSmall}>RELISH is for Feelings</Text>
        <Text style={styles.footerSmall}>CATSUP (Learning) · BBQE (Safety)</Text>
        <Text style={styles.footerTiny}>© 2026 3_6_NIFE.pi · 36Nife@gmail.com</Text>
      </View>

    </ScrollView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({

  // Container
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },

  // sauc-e Header
  sauceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    flexWrap: 'wrap',
  },
  sauceName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8b1a1a',
  },
  sauceTagline: {
    fontSize: 13,
    color: '#999',
  },
  sauceHeart: {
    fontSize: 13,
  },
  sauceLogoText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sauceNav: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  sauceNavLink: {
    color: '#8b1a1a',
    fontSize: 13,
    fontWeight: '500',
  },

  // RELISH Header
  header: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 10,
  },
  relishLogoImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 4,
  },
  philosophy: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },

  // Premium Counter
  premiumSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  premiumPill: {
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  premiumPillUrgent: {
    backgroundColor: '#c0392b',
  },
  premiumPillText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  // App Content
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginTop: 24,
    marginBottom: 12,
  },
  contextButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
    marginBottom: 8,
  },
  contextButtonActive: {
    backgroundColor: '#4ECDC4',
    borderLeftColor: '#fff',
  },
  contextText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#333',
    color: 'white',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  wisdomButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  wisdomButtonDisabled: {
    opacity: 0.6,
  },
  wisdomButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  wisdomBox: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  wisdomTitle: {
    color: '#4ECDC4',
    fontWeight: '700',
    marginBottom: 8,
  },
  wisdomText: {
    color: '#ccc',
    lineHeight: 20,
  },

  // Marketing Images
  marketingSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  usVsThemImage: {
    width: '100%',
    maxWidth: 700,
    height: undefined,
    aspectRatio: 1.3,
    borderRadius: 8,
  },
  peakFlavourImage: {
    width: '100%',
    maxWidth: 600,
    height: undefined,
    aspectRatio: 1.0,
    borderRadius: 8,
  },

  // Subscribe CTA
  ctaSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4ECDC4',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 8,
  },
  ctaHotdog: {
    fontSize: 13,
    color: '#777',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  // Legal
  legalSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    flexWrap: 'wrap',
  },
  legalLink: {
    color: '#666',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    color: '#444',
    fontSize: 12,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 10,
  },
  footerBrand: {
    color: '#8b1a1a',
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 6,
  },
  footerTagline: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 12,
  },
  footerSmall: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  footerTiny: {
    color: '#555',
    fontSize: 10,
    marginTop: 12,
  },
});

export default RELISH;
