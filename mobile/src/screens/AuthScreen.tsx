import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../theme/colors';
import { Eye, EyeOff, Lock, Mail, User, ShieldCheck, ArrowRight } from 'lucide-react-native';

interface AuthScreenProps {
  onDismiss?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onDismiss }) => {
  const theme = useAppTheme();
  const { signIn, signUp } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (isSignUp && !fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      if (isSignUp) {
        const { error } = await signUp(email.trim(), password, fullName.trim());
        if (error) throw error;
      } else {
        const { error } = await signIn(email.trim(), password);
        if (error) throw error;
      }
      onDismiss?.();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.canvas }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={[styles.brandBadge, { backgroundColor: theme.brand }]}>
            <Text style={[styles.brandBadgeText, { color: theme.forestDark }]}>S</Text>
          </View>
          <Text style={[styles.brandTitle, { color: theme.textMain }]}>Sinance</Text>
          <Text style={[styles.brandSubtitle, { color: theme.textMuted }]}>
            Sovereign Personal Finance & Life OS
          </Text>
        </View>

        {/* Card Form Container */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.cardContainer,
              borderColor: theme.cardContainerBorder,
            },
          ]}
        >
          {/* Tabs: Sign In / Create Account */}
          <View style={[styles.tabBar, { backgroundColor: theme.surfaceSubtle }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setIsSignUp(false);
                setErrorMessage(null);
              }}
              style={[
                styles.tabItem,
                !isSignUp && { backgroundColor: theme.brand },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: !isSignUp ? theme.forestDark : theme.textMuted },
                  !isSignUp && styles.tabTextActive,
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setIsSignUp(true);
                setErrorMessage(null);
              }}
              style={[
                styles.tabItem,
                isSignUp && { backgroundColor: theme.brand },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isSignUp ? theme.forestDark : theme.textMuted },
                  isSignUp && styles.tabTextActive,
                ]}
              >
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Banner */}
          {errorMessage && (
            <View style={[styles.errorBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <Text style={[styles.errorText, { color: '#EF4444' }]}>
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.formGroup}>
            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Full Name</Text>
                <View
                  style={[
                    styles.inputFieldWrap,
                    {
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.borderSubtle,
                    },
                  ]}
                >
                  <User size={18} color={theme.textDim} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: theme.textMain }]}
                    placeholder="e.g. Sagar Sylada"
                    placeholderTextColor={theme.textDim}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Email Address</Text>
              <View
                style={[
                  styles.inputFieldWrap,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.borderSubtle,
                  },
                ]}
              >
                <Mail size={18} color={theme.textDim} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { color: theme.textMain }]}
                  placeholder="name@example.com"
                  placeholderTextColor={theme.textDim}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Password</Text>
              <View
                style={[
                  styles.inputFieldWrap,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.borderSubtle,
                  },
                ]}
              >
                <Lock size={18} color={theme.textDim} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { color: theme.textMain }]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.textDim}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.eyeBtn}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={theme.textDim} />
                  ) : (
                    <Eye size={18} color={theme.textDim} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={loading}
            style={[
              styles.submitButton,
              { backgroundColor: theme.brand },
              loading && { opacity: 0.7 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color={theme.forestDark} size="small" />
            ) : (
              <View style={styles.submitBtnContent}>
                <Text style={[styles.submitButtonText, { color: theme.forestDark }]}>
                  {isSignUp ? 'Create Cloud Account' : 'Sign In to Cloud'}
                </Text>
                <ArrowRight size={18} color={theme.forestDark} />
              </View>
            )}
          </TouchableOpacity>

          {/* Guest / Skip Option */}
          {onDismiss && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onDismiss}
              style={styles.skipButton}
            >
              <Text style={[styles.skipButtonText, { color: theme.textMuted }]}>
                Continue as Guest / Explore
              </Text>
            </TouchableOpacity>
          )}

          {/* Security Footnote */}
          <View style={styles.securityRow}>
            <ShieldCheck size={14} color={theme.brand} />
            <Text style={[styles.securityText, { color: theme.textDim }]}>
              Protected with End-to-End Row Level Security
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandBadgeText: {
    fontSize: 22,
    fontWeight: '900',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    fontWeight: '800',
  },
  errorBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  formGroup: {
    gap: 16,
    marginBottom: 24,
  },
  inputContainer: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  inputFieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 4,
  },
  submitButton: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  submitBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  skipButton: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  skipButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 8,
  },
  securityText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
