import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../lib/firebase";

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedUsername || !normalizedEmail || !password) {
      setError("Preencha todos os campos.");
      return;
    }

    if (!/^[a-zA-Z0-9]{3,24}$/.test(normalizedUsername)) {
      setError("O username deve ter 3 a 24 caracteres e usar apenas letras e números, sem espaços ou símbolos.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail)) {
      setError("Digite um e-mail válido.");
      return;
    }

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      await setDoc(doc(db, "usuarios", credential.user.uid), {
        username: normalizedUsername,
        displayName: normalizedUsername,
        email: normalizedEmail,
      });
      router.replace("/login");
    } catch (registrationError) {
      setError(getAuthErrorMessage(registrationError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" style={styles.scrollView}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
            <Text style={styles.backLabel}>Voltar</Text>
          </Pressable>
          <Text style={styles.kicker}>NOVA CONTA</Text>
          <Text style={styles.title}>Vamos começar.</Text>
          <Text style={styles.subtitle}>Preencha seus dados para criar sua conta.</Text>
          <View style={styles.form}>
            <UsernameField placeholder="Nome de usuário" value={username} onChangeText={setUsername} />
            <Field label="E-mail" placeholder="exemplo@email.com" keyboardType="email-address" value={email} onChangeText={setEmail} />
            <Field label="Senha" placeholder="Crie sua senha" secureTextEntry value={password} onChangeText={setPassword} />
            <PasswordStrength password={password} />
            <Field label="Confirmar senha" placeholder="Digite sua senha novamente" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
          </View>
          <Pressable disabled={isSubmitting} onPress={handleRegister} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
            {isSubmitting ? <ActivityIndicator color="#F2F4FF" /> : <Text style={styles.buttonText}>Criar minha conta</Text>}
          </Pressable>
          {!!error && <Text style={styles.error}>{error}</Text>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getAuthErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "Este e-mail já está cadastrado.";
      case "auth/invalid-email":
        return "Digite um e-mail válido.";
      case "auth/weak-password":
        return "A senha precisa ter pelo menos 6 caracteres.";
    }
  }

  return "Não foi possível criar a conta. Tente novamente.";
}

type FieldProps = React.ComponentProps<typeof TextInput> & { label: string };

function UsernameField(props: React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>Username</Text>
      <View style={styles.usernameInput}>
        <Text style={styles.usernamePrefix}>@</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="ladob"
          placeholderTextColor="#829397"
          style={styles.usernameTextInput}
          {...props}
        />
      </View>
    </View>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const score = getPasswordScore(password);
  const [progress] = useState(() => new Animated.Value(0));
  const labels = ["", "Fraca", "Razoável", "Boa", "Forte"];
  const colors = ["#CDD5F0", "#B4234D", "#C27A2C", "#4E70C8", "#23836B"];

  useEffect(() => {
    Animated.timing(progress, {
      duration: 220,
      toValue: score / 4,
      useNativeDriver: false,
    }).start();
  }, [progress, score]);

  return (
    <View style={styles.strengthContainer}>
      <View style={styles.strengthTrack}>
        <Animated.View
          style={[
            styles.strengthFill,
            {
              backgroundColor: colors[score],
              width: progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
            },
          ]}
        />
      </View>
      <Text style={[styles.strengthText, { color: colors[score] }]}>{password ? labels[score] : ""}</Text>
    </View>
  );
}

function getPasswordScore(password: string) {
  if (!password) return 0;

  let score = 0;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

function Field({ label, ...props }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize={label === "E-mail" ? "none" : "sentences"}
        placeholderTextColor="#829397"
        style={styles.input}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#F2F4FF", flex: 1 },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: 28, paddingBottom: 96 },
  backButton: { alignItems: "center", flexDirection: "row", marginBottom: 56 },
  backText: { color: "#182452", fontSize: 34, lineHeight: 26, marginRight: 8 },
  backLabel: { color: "#53618F", fontSize: 14, fontWeight: "700" },
  kicker: { color: "#6657C8", fontSize: 12, fontWeight: "800", letterSpacing: 2, marginBottom: 12 },
  title: { color: "#182452", fontSize: 38, fontWeight: "800", lineHeight: 44 },
  subtitle: { color: "#64709A", fontSize: 16, lineHeight: 24, marginTop: 12 },
  form: { gap: 20, marginTop: 42 },
  field: { gap: 8 },
  strengthContainer: { gap: 7, marginTop: -10 },
  strengthTrack: { backgroundColor: "#DDE3F7", borderRadius: 3, height: 6, overflow: "hidden", width: "100%" },
  strengthFill: { borderRadius: 3, height: 6 },
  strengthText: { fontSize: 12, fontWeight: "700" },
  label: { color: "#263568", fontSize: 13, fontWeight: "800" },
  usernameInput: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#CDD5F0",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 56,
  },
  usernamePrefix: { color: "#6657C8", fontSize: 20, fontWeight: "800", paddingLeft: 16 },
  usernameTextInput: { color: "#182452", flex: 1, fontSize: 16, minHeight: 56, paddingHorizontal: 8, paddingRight: 16 },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CDD5F0",
    borderRadius: 12,
    borderWidth: 1,
    color: "#182452",
    fontSize: 16,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  button: { alignItems: "center", backgroundColor: "#263B91", borderRadius: 14, justifyContent: "center", marginTop: 34, minHeight: 58 },
  buttonText: { color: "#F2F4FF", fontSize: 16, fontWeight: "800" },
  pressed: { opacity: 0.75 },
  error: { color: "#B4234D", fontSize: 13, lineHeight: 19, marginTop: 16, textAlign: "center" },
  note: { color: "#7D88AD", fontSize: 12, lineHeight: 18, marginTop: 16, textAlign: "center" },
});