import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  X,
  Mic,
  Camera,
  Keyboard,
  Send,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Receipt,
  ArrowUpRight,
  TrendingDown,
  Volume2,
} from 'lucide-react-native';
import { useAppTheme } from '../theme/colors';
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
  const [activeModality, setActiveModality] = useState<'text' | 'voice' | 'camera'>('voice');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<SinsMessage[]>([
    {
      id: 'welcome',
      sender: 'sins',
      text: "Hey! I'm Sins. I monitor your entire financial stack in real-time. What would you like to do today?",
      timestamp: 'Just now',
    },
  ]);

  const scrollViewRef = useRef<any>(null);

  // Animated halo / aura values for Apple Intelligence glowing horizon effect
  const auraPulseAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const micWaveAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Slide up bottom Gemini card
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Continuous breathing aura loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(auraPulseAnim, {
            toValue: 1,
            duration: 2600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(auraPulseAnim, {
            toValue: 0,
            duration: 2600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      slideAnim.setValue(100);
      auraPulseAnim.setValue(0);
      setIsListening(false);
    }
  }, [visible]);

  // Voice listening simulation wave
  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (isListening) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(micWaveAnim, {
            toValue: 1.28,
            duration: 450,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(micWaveAnim, {
            toValue: 0.95,
            duration: 450,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
    } else {
      micWaveAnim.setValue(1);
    }
    return () => {
      loop?.stop();
    };
  }, [isListening]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: SinsMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query.trim(),
      timestamp: 'Just now',
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsListening(false);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Process intelligence query through BrainService
    setTimeout(() => {
      const result = BrainService.processQuery(query, contextData);

      const sinsMsg: SinsMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'sins',
        text: result.response,
        timestamp: 'Just now',
        actionCard: result.actionCard,
      };

      setMessages((prev) => [...prev, sinsMsg]);

      // Execute side-effects if any
      if (result.createTransaction && onExecuteTransaction) {
        onExecuteTransaction(result.createTransaction);
      }
      if (result.payBillId && onPayBill) {
        onPayBill(result.payBillId);
      }

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }, 400);
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setActiveModality('voice');
      // Simulate speech recognition response after 2.8s
      setTimeout(() => {
        setIsListening(false);
        handleSendMessage('How much did I spend this week?');
      }, 2800);
    }
  };

  const handleCameraScan = () => {
    setActiveModality('camera');
    handleSendMessage('Scan receipt for Whole Foods Grocery');
  };

  // Quick suggestion chips
  const quickPrompts = [
    'How much did I spend this week?',
    'Pay Netflix bill',
    'Show total portfolio balance',
    'Spent ₹350 on lunch',
  ];

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
        {/* Backdrop touch to dismiss */}
        <TouchableOpacity
          activeOpacity={1}
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        {/* ================= APPLE INTELLIGENCE AMBIENT AURA (PULSATING GLOW) ================= */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ambientAuraWrapper,
            {
              opacity: auraPulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.38, 0.78],
              }),
              transform: [
                {
                  scale: auraPulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.97, 1.05],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Outer diffuse emerald halo */}
          <View
            style={[
              styles.auraHaloOuter,
              {
                backgroundColor: theme.isDark ? 'rgba(35, 240, 125, 0.18)' : 'rgba(5, 150, 105, 0.14)',
                shadowColor: theme.brand,
              },
            ]}
          />
          {/* Inner intense neon glow ring */}
          <View
            style={[
              styles.auraHaloInner,
              {
                borderColor: theme.isDark ? 'rgba(35, 240, 125, 0.35)' : 'rgba(5, 150, 105, 0.3)',
              },
            ]}
          />
        </Animated.View>

        {/* ================= FLOATING GEMINI BOTTOM CARD ================= */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              backgroundColor: theme.isDark ? 'rgba(16, 24, 20, 0.94)' : 'rgba(255, 255, 255, 0.96)',
              borderColor: theme.borderSubtle,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Card Top Drag Handle & Controls */}
          <View style={styles.cardHeader}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.agentBadge, { backgroundColor: theme.surfaceSubtle }]}>
                <StatusSymbol size={14} color={theme.brand} strokeWidth={2.4} />
                <Text style={[styles.agentName, { color: theme.textMain }]}>Sins</Text>
              </View>
              <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
                What would you like to do today?
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: theme.surfaceSubtle }]}
            >
              <X size={16} color={theme.textMain} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* Quick suggestions horizontal scroll */}
          <View style={styles.quickPromptsWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickPromptsScroll}
            >
              {quickPrompts.map((prompt, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.7}
                  onPress={() => handleSendMessage(prompt)}
                  style={[
                    styles.promptChip,
                    {
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.borderSubtle,
                    },
                  ]}
                >
                  <Text style={[styles.promptChipText, { color: theme.textMain }]}>
                    {prompt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Chat Messages Stream */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatScroll}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => {
              const isSins = msg.sender === 'sins';
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageRow,
                    isSins ? styles.messageRowLeft : styles.messageRowRight,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isSins
                        ? [styles.sinsBubble, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]
                        : [styles.userBubble, { backgroundColor: theme.brand }],
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        { color: isSins ? theme.textMain : theme.forestDark },
                      ]}
                    >
                      {msg.text}
                    </Text>

                    {/* Action Execution Receipt Card (App-wide impact) */}
                    {msg.actionCard && (
                      <View
                        style={[
                          styles.actionCardWrap,
                          {
                            backgroundColor: theme.cardContainer,
                            borderColor: theme.borderSubtle,
                          },
                        ]}
                      >
                        <View style={styles.actionCardTop}>
                          <View style={styles.actionCardTitleRow}>
                            <CheckCircle2
                              size={15}
                              color={theme.isDark ? '#23F07D' : '#059669'}
                              strokeWidth={2.4}
                            />
                            <Text
                              style={[styles.actionCardTitle, { color: theme.textMain }]}
                              numberOfLines={1}
                            >
                              {msg.actionCard.title}
                            </Text>
                          </View>
                          {msg.actionCard.amount && (
                            <Text
                              style={[
                                styles.actionCardAmount,
                                { color: theme.isDark ? '#23F07D' : '#059669' },
                              ]}
                            >
                              {msg.actionCard.amount}
                            </Text>
                          )}
                        </View>
                        <Text style={[styles.actionCardDetail, { color: theme.textMuted }]}>
                          {msg.actionCard.detail}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}

            {isListening && (
              <View style={[styles.listeningIndicator, { backgroundColor: theme.surfaceSubtle }]}>
                <Volume2 size={16} color={theme.brand} strokeWidth={2.4} />
                <Text style={[styles.listeningText, { color: theme.textMain }]}>
                  Sins is listening...
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Active text input bar (when typing mode active) */}
          {activeModality === 'text' && (
            <View style={[styles.textInputBar, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask Sins anything..."
                placeholderTextColor={theme.textDim}
                style={[styles.textInputField, { color: theme.textMain }]}
                onSubmitEditing={() => handleSendMessage()}
                returnKeyType="send"
                autoFocus
              />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSendMessage()}
                style={[styles.sendBtn, { backgroundColor: theme.brand }]}
              >
                <Send size={15} color={theme.forestDark} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>
          )}

          {/* ================= FLOATING MODALITY PILL (TYPE, TALK, SHARE A PHOTO) ================= */}
          <View style={styles.bottomPillContainer}>
            <View
              style={[
                styles.modalityPill,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              {/* Type / Keyboard Button */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveModality(activeModality === 'text' ? 'voice' : 'text')}
                style={[
                  styles.pillButton,
                  activeModality === 'text' && { backgroundColor: theme.surfaceSubtle },
                ]}
              >
                <Keyboard
                  size={19}
                  color={activeModality === 'text' ? theme.brand : theme.textMain}
                  strokeWidth={2.2}
                />
              </TouchableOpacity>

              {/* Scalloped Center Waveform / Mic Disc */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleVoiceToggle}
                style={styles.micDiscWrapper}
              >
                <Animated.View
                  style={[
                    styles.scallopedMicDisc,
                    {
                      backgroundColor: theme.isDark ? theme.brand : theme.forestDark,
                      transform: [{ scale: micWaveAnim }],
                    },
                  ]}
                >
                  <Mic
                    size={20}
                    color={theme.isDark ? theme.forestDark : '#FFFFFF'}
                    strokeWidth={2.4}
                  />
                </Animated.View>
              </TouchableOpacity>

              {/* Share a Photo / Receipt Scanner */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleCameraScan}
                style={[
                  styles.pillButton,
                  activeModality === 'camera' && { backgroundColor: theme.surfaceSubtle },
                ]}
              >
                <Camera
                  size={19}
                  color={activeModality === 'camera' ? theme.brand : theme.textMain}
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  ambientAuraWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 380,
    alignItems: 'center',
    justifyContent: 'center',
  },
  auraHaloOuter: {
    position: 'absolute',
    bottom: -60,
    width: '110%',
    height: 320,
    borderRadius: 160,
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.85,
    shadowRadius: 42,
    elevation: 16,
  },
  auraHaloInner: {
    position: 'absolute',
    bottom: -30,
    width: '95%',
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
    opacity: 0.65,
  },
  cardContainer: {
    width: '94%',
    maxWidth: 520,
    height: 480,
    marginBottom: Platform.OS === 'ios' ? 26 : 18,
    borderRadius: 28,
    borderWidth: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  agentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  agentName: {
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickPromptsWrapper: {
    marginBottom: 10,
  },
  quickPromptsScroll: {
    gap: 8,
    paddingRight: 10,
  },
  promptChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  promptChipText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    paddingVertical: 6,
    gap: 10,
  },
  messageRow: {
    flexDirection: 'row',
    width: '100%',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  sinsBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: '500',
  },
  actionCardWrap: {
    marginTop: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  actionCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 12.5,
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
  listeningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 6,
  },
  listeningText: {
    fontSize: 12,
    fontWeight: '600',
  },
  textInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
  },
  textInputField: {
    flex: 1,
    fontSize: 13.5,
    paddingVertical: 6,
  },
  sendBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPillContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  modalityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 196,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  pillButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micDiscWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scallopedMicDisc: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
});
