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
  ExternalLink,
  CheckCircle2,
} from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';
import { PixelMorphMatrix } from './PixelMorphMatrix';
import { StatusSymbol } from './StatusSymbol';
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

  const slideAnim = useRef(new Animated.Value(280)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 9,
        tension: 50,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(280);
      setIsListening(false);
      setActiveModality('overview');
      setActiveResponse(null);
    }
  }, [visible]);

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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Dismiss Backdrop */}
        <TouchableOpacity
          activeOpacity={1}
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        {/* ================= FULL-WIDTH GEMINI CARD ================= */}
        <Animated.View
          style={[
            styles.geminiCard,
            {
              backgroundColor: theme.isDark ? '#181C19' : '#FFFFFF',
              borderColor: theme.borderSubtle,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Top Bar: Icon + "What would you like to do today?" + Actions */}
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <PixelMorphMatrix
                size={16}
                color={theme.isDark ? '#23F07D' : '#059669'}
                glowColor={theme.isDark ? 'rgba(35, 240, 125, 0.45)' : 'rgba(5, 150, 105, 0.35)'}
                isThinking={true}
              />
              <Text style={[styles.topPromptText, { color: theme.textMuted }]}>
                What would you like to do today?
              </Text>
            </View>

            <View style={styles.topBarRight}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onClose}
                style={styles.iconHit}
              >
                <X size={18} color={theme.textDim} strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
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
              <View style={styles.textInputContainer}>
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

          {/* Bottom Dock Control Pill (Matching Reference) */}
          <View style={styles.bottomDockWrapper}>
            <View
              style={[
                styles.bottomModalityPill,
                {
                  backgroundColor: theme.isDark ? '#E5E7EB' : '#141414',
                },
              ]}
            >
              {/* Keyboard (Type) */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveModality(activeModality === 'text' ? 'overview' : 'text')}
                style={styles.pillActionBtn}
              >
                <Keyboard
                  size={20}
                  color={theme.isDark ? '#111827' : '#FFFFFF'}
                  strokeWidth={2.2}
                />
              </TouchableOpacity>

              {/* Scalloped Mic Organic Cloud (Talk) */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleVoiceToggle}
                style={[
                  styles.pillMicScallop,
                  {
                    backgroundColor: theme.isDark ? '#D1D5DB' : '#27272A',
                  },
                  isListening && {
                    backgroundColor: theme.brand,
                  },
                ]}
              >
                <Mic
                  size={22}
                  color={theme.isDark ? '#111827' : '#FFFFFF'}
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
                  size={20}
                  color={theme.isDark ? '#111827' : '#FFFFFF'}
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
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
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
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
    gap: 8,
    flex: 1,
  },
  topPromptText: {
    fontSize: 13.5,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconHit: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerStage: {
    minHeight: 88,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  heroPromptWrapper: {
    paddingVertical: 4,
  },
  heroPromptText: {
    fontSize: 27,
    fontWeight: '400',
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  mainInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: -0.4,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  responseContainer: {
    gap: 8,
  },
  responseText: {
    fontSize: 15,
    lineHeight: 21,
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
    paddingBottom: 4,
  },
  bottomModalityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 172,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 8,
  },
  pillActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillMicScallop: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
