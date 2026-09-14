import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../lib/firebase";

type Profile = {
  username: string;
  displayName: string;
};

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [profile, setProfile] = useState<Profile>({ username: "", displayName: "" });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  async function loadProfile(uid: string) {
    const profileSnapshot = await getDoc(doc(db, "usuarios", uid));
    const data = profileSnapshot.data();
    const nextProfile = {
      username: typeof data?.username === "string" ? data.username : "usuario",
      displayName: typeof data?.displayName === "string" ? data.displayName : "usuario",
    };
    setProfile(nextProfile);
    setDisplayName(nextProfile.displayName);
  }

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      if (!nextUser) {
        router.replace("/");
        return;
      }

      setUser(nextUser);
      setIsCheckingSession(false);
      void loadProfile(nextUser.uid);
    });
  }, [router]);

  async function handleSaveDisplayName() {
    if (!user || !displayName.trim()) return;

    setIsSaving(true);
    await updateDoc(doc(db, "usuarios", user.uid), { displayName: displayName.trim() });
    setProfile((currentProfile) => ({ ...currentProfile, displayName: displayName.trim() }));
    setIsEditing(false);
    setIsSaving(false);
  }

  async function handleSignOut() {
    await signOut(auth);
    router.replace("/");
  }

  if (isCheckingSession) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>LADO B</Text>
            <Text style={styles.heading}>Seu espaço musical.</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => setIsMenuOpen((open) => !open)} style={styles.avatarButton}>
            <Image source={require("../../assets/images/icon.png")} style={styles.avatar} />
          </Pressable>
        </View>

        {isMenuOpen && (
          <View style={styles.profileMenu}>
            <Image source={require("../../assets/images/icon.png")} style={styles.menuAvatar} />
            <Text style={styles.menuDisplayName}>{profile.displayName || "Seu nome"}</Text>
            <Text style={styles.menuUsername}>@{profile.username || "usuario"}</Text>
            {isEditing ? (
              <View style={styles.editArea}>
                <TextInput
                  autoFocus
                  onChangeText={setDisplayName}
                  placeholder="Seu display name"
                  placeholderTextColor="#8995C0"
                  style={styles.editInput}
                  value={displayName}
                />
                <Pressable disabled={isSaving} onPress={handleSaveDisplayName} style={styles.saveButton}>
                  {isSaving ? <ActivityIndicator color="#F3F5FF" size="small" /> : <Text style={styles.saveText}>Salvar</Text>}
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => setIsEditing(true)} style={styles.editButton}>
                <Text style={styles.editIcon}>✎</Text>
                <Text style={styles.editText}>Alterar perfil</Text>
              </Pressable>
            )}
            <Pressable onPress={() => router.push("/settings" as never)} style={styles.settingsButton}>
              <Text style={styles.settingsText}>Configurações</Text>
            </Pressable>
            <Pressable onPress={handleSignOut} style={styles.signOutButton}>
              <Text style={styles.signOutText}>Sair</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#10183C", flex: 1 },
  container: { flex: 1, paddingHorizontal: 24 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingTop: 18 },
  brand: { color: "#9EA9FF", fontSize: 12, fontWeight: "800", letterSpacing: 2 },
  heading: { color: "#F3F5FF", fontSize: 24, fontWeight: "800", marginTop: 8 },
  avatarButton: { borderColor: "#8490FF", borderRadius: 28, borderWidth: 2, padding: 2 },
  avatar: { borderRadius: 24, height: 48, width: 48 },
  profileMenu: { alignSelf: "flex-end", backgroundColor: "#F2F4FF", borderRadius: 18, marginTop: 12, padding: 18, width: 250 },
  menuAvatar: { borderRadius: 28, height: 56, marginBottom: 12, width: 56 },
  menuDisplayName: { color: "#182452", fontSize: 18, fontWeight: "800" },
  menuUsername: { color: "#6657C8", fontSize: 14, marginTop: 4 },
  editArea: { gap: 10, marginTop: 18 },
  editInput: { backgroundColor: "#FFFFFF", borderColor: "#CDD5F0", borderRadius: 10, borderWidth: 1, color: "#182452", minHeight: 44, paddingHorizontal: 12 },
  saveButton: { alignItems: "center", backgroundColor: "#263B91", borderRadius: 10, minHeight: 42, justifyContent: "center" },
  saveText: { color: "#F3F5FF", fontWeight: "800" },
  editButton: { alignItems: "center", flexDirection: "row", marginTop: 18 },
  editIcon: { color: "#6657C8", fontSize: 21, marginRight: 8 },
  editText: { color: "#263B91", fontSize: 14, fontWeight: "800" },
  settingsButton: { marginTop: 14 },
  settingsText: { color: "#263B91", fontSize: 14, fontWeight: "800" },
  signOutButton: { borderTopColor: "#DDE3F7", borderTopWidth: 1, marginTop: 18, paddingTop: 14 },
  signOutText: { color: "#B4234D", fontSize: 14, fontWeight: "700" },
});