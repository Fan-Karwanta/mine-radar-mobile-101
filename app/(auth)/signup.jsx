import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import styles from "../../assets/styles/signup.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [completeName, setCompleteName] = useState("");
  const [agency, setAgency] = useState("");
  const [position, setPosition] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { user, isLoading, register, token } = useAuthStore();

  const router = useRouter();

  const handleSignUp = async () => {
    const result = await register(email, password, completeName, agency, position, contactNumber);

    if (result.success) {
      router.replace("/(tabs)/directory");
    } else {
      Alert.alert("Error", result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* BACKGROUND IMAGE */}
        <Image
          source={require("../../assets/images/mgb-logo.png")}
          style={styles.backgroundImage}
          resizeMode="contain"
        />
        
        <View style={styles.card}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Mine Radar ⛏️</Text>
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          <View style={styles.formContainer}>
            {/* COMPLETE NAME INPUT */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Complete Name (Surname, First Name, M.I.)</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Dela Cruz, Juan P."
                  placeholderTextColor={COLORS.placeholderText}
                  value={completeName}
                  onChangeText={setCompleteName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* EMAIL INPUT */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="johndoe@gmail.com"
                  value={email}
                  placeholderTextColor={COLORS.placeholderText}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* AGENCY/COMPANY INPUT */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Agency/Company</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="business-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="DENR"
                  placeholderTextColor={COLORS.placeholderText}
                  value={agency}
                  onChangeText={setAgency}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* POSITION/DESIGNATION INPUT */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Position/Designation</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="briefcase-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Secretary"
                  placeholderTextColor={COLORS.placeholderText}
                  value={position}
                  onChangeText={setPosition}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* CONTACT NUMBER INPUT */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="+63 912 345 6789"
                  placeholderTextColor={COLORS.placeholderText}
                  value={contactNumber}
                  onChangeText={setContactNumber}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* PASSWORD INPUT */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="******"
                  placeholderTextColor={COLORS.placeholderText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* SIGNUP BUTTON */}
            <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* FOOTER */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.link}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
