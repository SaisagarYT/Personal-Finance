import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  X,
  Mic,
  Camera,
  Keyboard,
  Send,
  CheckCircle2,
} from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';
import { PixelMorphMatrix } from './PixelMorphMatrix';
import { BrainService, SinsMessage, AppContextData } from '../services/brainService';

interface SinsBrainModalProps {
  visible: boolean;
  onClose: () => void;
  contextData: AppContextData;
  onExecuteTransaction?: (tx: any) => void;
  onPayBill?: (billId: string) => void;
}

export const SinsBrainModal: React.FC<SinsBrainModalProps> = ({
  visible,
  onClose,
  contextData,
  onExecuteTransaction,
  onPayBill,
}) => {
  const theme = useAppTheme();
  const [inputText, setInputText] = useState('');
  const [activeModality, setActiveModality] = useState<'overview' | 'text' | 'voice'>('overview');
  const [isListening, setIsListening] = useState(false);
  const [activeResponse, setActiveResponse] = useState<SinsMessage | null>(null);

  // Modal mount control for clean reverse exit animation
  const [isMounted, setIsMounted] = useState(visible);

  const slideAnim = useRef(new Animated.Value(320)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 9,
          tension: 45,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (isMounted) {
      // Smooth reverse exit transition
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 320,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsMounted(false);
        setIsListening(false);
        setActiveModality('overview');
        setActiveResponse(null);
      });
    }
  }, [visible]);

  const handleSmoothClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 320,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      setIsMounted(false);
      setIsListening(false);
      setActiveModality('overview');
      setActiveResponse(null);
    });
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    setInputText('');
    setIsListening(false);

    const result = BrainService.processQuery(query, contextData);
    const sinsMsg: SinsMessage = {
      id: Date.now().toString(),
      sender: 'sins',
      text: result.response,
      timestamp: 'Just now',
      actionCard: result.actionCard,
    };
    setActiveResponse(sinsMsg);

    if (result.createTransaction && onExecuteTransaction) {
      onExecuteTransaction(result.createTransaction);
    }
    if (result.payBillId && onPayBill) {
      onPayBill(result.payBillId);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
      setActiveModality('overview');
    } else {
      setIsListening(true);
      setActiveModality('voice');
      setTimeout(() => {
        setIsListening(false);
        handleSendMessage('How much did I spend this week?');
      }, 2400);
    }
  };

  const handleCameraScan = () => {
    handleSendMessage('Scan receipt for Whole Foods Grocery');
  };

  if (!isMounted) return null;

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={handleSmoothClose}
    >
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Animated Dim Backdrop */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={StyleSheet.absoluteFill}
            onPress={handleSmoothClose}
          />
        </Animated.View>

        {/* ================= FULL-WIDTH SINANCE PREMIUM CARD ================= */}
        <Animated.View
          style={[
            styles.geminiCard,
            {
              backgroundColor: theme.cardContainer,
              borderColor: theme.borderSubtle,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Top Bar: 4-Block Animated Matrix + "What would you like to do today?" + Dismiss */}
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <PixelMorphMatrix size={16} durationMs={1600} />
              <Text style={[styles.topPromptText, { color: theme.textMuted }]}>
                What would you like to do today?
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSmoothClose}
              style={[styles.closeHit, { backgroundColor: theme.surfaceSubtle }]}
            >
              <X size={15} color={theme.textMain} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          {/* Center Main Stage */}
          <View style={styles.centerStage}>
            {activeResponse ? (
              <View style={styles.responseContainer}>
                <Text
                  style={[styles.responseText, { color: theme.textMain }]}
                  numberOfLines={2}
                >
                  {activeResponse.text}
                </Text>

                {activeResponse.actionCard && (
                  <View
                    style={[
                      styles.actionCard,
                      {
                        backgroundColor: theme.surfaceSubtle,
                        borderColor: theme.borderSubtle,
                      },
                    ]}
                  >
                    <View style={styles.actionCardTop}>
                      <View style={styles.actionCardRow}>
                        <CheckCircle2
                          size={15}
                          color={theme.isDark ? '#23F07D' : '#059669'}
                          strokeWidth={2.4}
                        />
                        <Text
                          style={[styles.actionCardTitle, { color: theme.textMain }]}
                          numberOfLines={1}
                        >
                          {activeResponse.actionCard.title}
                        </Text>
                      </View>
                      {activeResponse.actionCard.amount && (
                        <Text
                          style={[
                            styles.actionCardAmount,
                            { color: theme.isDark ? '#23F07D' : '#059669' },
                          ]}
                        >
                          {activeResponse.actionCard.amount}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[styles.actionCardDetail, { color: theme.textMuted }]}
                      numberOfLines={1}
                    >
                      {activeResponse.actionCard.detail}
                    </Text>
                  </View>
                )}
              </View>
            ) : isListening ? (
              <View style={styles.listeningContainer}>
                <Text style={[styles.listeningTitle, { color: theme.textMain }]}>
                  Listening...
                </Text>
                <Text style={[styles.listeningSubtitle, { color: theme.textMuted }]}>
                  Speak to log expenses, check bills, or manage accounts
                </Text>
              </View>
            ) : activeModality === 'text' ? (
              <View style={[styles.textInputContainer, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Ask Sins anything..."
                  placeholderTextColor={theme.textDim}
                  style={[styles.mainInput, { color: theme.textMain }]}
                  onSubmitEditing={() => handleSendMessage()}
                  returnKeyType="send"
                  autoFocus
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleSendMessage()}
                  style={[styles.sendButton, { backgroundColor: theme.brand }]}
                >
                  <Send size={15} color={theme.forestDark} strokeWidth={2.4} />
                </TouchableOpacity>
              </View>
            ) : (
              /* Hero Callout matching reference: "Type, talk, or share a photo" */
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActiveModality('text')}
                style={styles.heroPromptWrapper}
              >
                <Text style={[styles.heroPromptText, { color: theme.textMain }]}>
                  Type, talk, or share a photo
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Bottom Dock Control Pill (Bound to Sinance Theme) */}
          <View style={styles.bottomDockWrapper}>
            <View
              style={[
                styles.bottomModalityPill,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              {/* Keyboard (Type) */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveModality(activeModality === 'text' ? 'overview' : 'text')}
                style={[
                  styles.pillActionBtn,
                  activeModality === 'text' && { backgroundColor: theme.surfaceSubtle },
                ]}
              >
                <Keyboard
                  size={19}
                  color={activeModality === 'text' ? (theme.isDark ? '#23F07D' : '#059669') : theme.textMain}
                  strokeWidth={2.2}
                />
              </TouchableOpacity>

              {/* Scalloped Mic Organic Button (Talk) */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleVoiceToggle}
                style={[
                  styles.pillMicScallop,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.borderSubtle,
                  },
                  isListening && {
                    backgroundColor: theme.brand,
                    borderColor: theme.brand,
                  },
                ]}
              >
                <Mic
                  size={20}
                  color={isListening ? theme.forestDark : theme.textMain}
                  strokeWidth={2.4}
                />
              </TouchableOpacity>

              {/* Camera (Share a Photo) */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleCameraScan}
                style={styles.pillActionBtn}
              >
                <Camera
                  size={19}
                  color={theme.textMain}
                  strokeWidth={2.2}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  geminiCard: {
    width: '100%',
    maxWidth: 440,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 26 : 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  topPromptText: {
    fontSize: 13.5,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  closeHit: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerStage: {
    minHeight: 84,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  heroPromptWrapper: {
    paddingVertical: 4,
  },
  heroPromptText: {
    fontSize: 26,
    fontWeight: '500',
    letterSpacing: -0.8,
    lineHeight: 33,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  mainInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.2,
    paddingVertical: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  responseContainer: {
    gap: 8,
  },
  responseText: {
    fontSize: 14.5,
    lineHeight: 20,
    fontWeight: '500',
  },
  actionCard: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 3,
  },
  actionCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionCardAmount: {
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6,
  },
  actionCardDetail: {
    fontSize: 11,
    fontWeight: '500',
  },
  listeningContainer: {
    gap: 4,
  },
  listeningTitle: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  listeningSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  bottomDockWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 2,
  },
  bottomModalityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 172,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3,
  },
  pillActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillMicScallop: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
