import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../lib/firebase";

export default function Index() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/home" as never);
      } else {
        setCheckingSession(false);
      }
    });
  }, [router]);

  if (checkingSession) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.hero}>
        <Image source={require("../../assets/images/icon.png")} style={styles.logo} />
        <Text style={styles.eyebrow}>LADO B</Text>
        <Text style={styles.title}>Sua próxima faixa favorita está aqui.</Text>
        <Text style={styles.subtitle}>
          Monte álbuns, crie playlists e descubra recomendações do seu jeito.
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.primaryButtonText}>Criar uma conta</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.secondaryButtonText}>Fazer login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#10252B",
    paddingHorizontal: 28,
    paddingVertical: 30,
  },
  hero: { alignItems: "center", paddingTop: 54 },
  logo: { borderRadius: 24, height: 108, marginBottom: 36, width: 108 },
  eyebrow: {
    color: "#9EA9FF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 14,
  },
  title: {
    color: "#F3F5FF",
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 46,
    textAlign: "center",
  },
  subtitle: {
    color: "#B7C0DD",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 18,
    maxWidth: 300,
    textAlign: "center",
  },
  actions: { gap: 14, width: "100%" },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#8490FF",
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 56,
  },
  primaryButtonText: { color: "#10183C", fontSize: 16, fontWeight: "800" },
  secondaryButton: {
    alignItems: "center",
    borderColor: "#5E6DA8",
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 56,
  },
  secondaryButtonText: { color: "#F3F5FF", fontSize: 16, fontWeight: "700" },
  pressed: { opacity: 0.75 },
  footer: { color: "#8995C0", fontSize: 12, marginTop: 10, textAlign: "center" },
});
