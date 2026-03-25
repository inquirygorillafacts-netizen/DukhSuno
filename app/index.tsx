import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { Heart, Headphones, MessageCircle, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

export default function WelcomeScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      {/* Hero Section with Aurora-style Gradient */}
      <View className="h-[400px] w-full relative overflow-hidden">
        <LinearGradient
          colors={['#4f46e5', '#10b981']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute inset-0"
        />
        
        {/* Glassmorphism content overlay */}
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-white/10 p-4 rounded-full mb-6">
            <Heart size={48} color="#ffffff" strokeWidth={1.5} />
          </View>
          <StyledText className="text-4xl font-bold text-white text-center mb-2">
            DukhSuno
          </StyledText>
          <StyledText className="text-lg text-white/80 text-center px-4">
            A Safe Space for Your Heart. Listen, Share, and Heal Together.
          </StyledText>
        </View>
      </View>

      {/* Action Cards */}
      <View className="px-6 -mt-10">
        <View className="bg-white rounded-3xl p-6 shadow-xl shadow-indigo-100 border border-indigo-50">
          <StyledText className="text-xl font-bold text-slate-800 mb-6 flex-row items-center">
            Get Started
          </StyledText>
          
          <View className="space-y-4">
            {/* Speaker Option */}
            <Link href="/onboarding" asChild>
              <TouchableOpacity className="flex-row items-center p-4 bg-rose-50 rounded-2xl border border-rose-100 mb-4">
                <View className="bg-rose-500/10 p-3 rounded-xl mr-4">
                  <MessageCircle size={24} color="#f43f5e" />
                </View>
                <View className="flex-1">
                  <StyledText className="font-bold text-rose-900">Sunane Wala</StyledText>
                  <StyledText className="text-xs text-rose-600">Share your feelings anonymously</StyledText>
                </View>
                <ArrowRight size={20} color="#f43f5e" />
              </TouchableOpacity>
            </Link>

            {/* Listener Option */}
            <Link href="/onboarding" asChild>
              <TouchableOpacity className="flex-row items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mb-4">
                <View className="bg-emerald-500/10 p-3 rounded-xl mr-4">
                  <Headphones size={24} color="#10b981" />
                </View>
                <View className="flex-1">
                  <StyledText className="font-bold text-emerald-900">Sunne Wala</StyledText>
                  <StyledText className="text-xs text-emerald-600">Be a companion and earn</StyledText>
                </View>
                <ArrowRight size={20} color="#10b981" />
              </TouchableOpacity>
            </Link>

            {/* Admin/Owner Option - subtle */}
            <TouchableOpacity className="items-center py-2">
              <StyledText className="text-slate-400 text-sm">
                Already have an account? <Text className="text-indigo-600 font-semibold">Login</Text>
              </StyledText>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Footer Info */}
      <View className="p-8 items-center">
        <StyledText className="text-slate-300 text-xs">
          Made with ♥ for mental health.
        </StyledText>
      </View>
    </ScrollView>
  );
}
