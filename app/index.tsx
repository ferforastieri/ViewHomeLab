import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, ActivityIndicator, Text, Alert, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CasaOSViewer() {
  const [serverUrl, setServerUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSettingsButton, setShowSettingsButton] = useState(false);
  const [isWebViewLoading, setIsWebViewLoading] = useState(false);

  useEffect(() => {
    // Carregar URL salvo
    loadSavedUrl();
  }, []);

  const loadSavedUrl = async () => {
    try {
      const savedUrl = await AsyncStorage.getItem('casaos_server_url');
      if (savedUrl) {
        setServerUrl(savedUrl);
        setIsConnected(true);
      } else {
        setShowSettings(true);
      }
    } catch (error) {
      console.error('Erro ao carregar URL:', error);
      setShowSettings(true);
    }
  };

  // Função para mostrar temporariamente o botão de configurações
  const showSettingsButtonTemporarily = () => {
    setShowSettingsButton(true);
    setTimeout(() => {
      setShowSettingsButton(false);
    }, 3000); // Esconde após 3 segundos
  };

  const saveUrl = async () => {
    if (!serverUrl) {
      Alert.alert('Erro', 'Por favor, insira o URL do servidor casaOS');
      return;
    }

    setIsLoading(true);
    try {
      // Verificar se o URL é válido
      const formattedUrl = serverUrl.startsWith('http') ? serverUrl : `http://${serverUrl}`;
      
      // Salvar URL
      await AsyncStorage.setItem('casaos_server_url', formattedUrl);
      setServerUrl(formattedUrl);
      setIsConnected(true);
      setShowSettings(false);
    } catch (error) {
      console.error('Erro ao salvar URL:', error);
      Alert.alert('Erro', 'Não foi possível salvar o URL. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const openSettings = () => {
    setShowSettings(true);
    setShowSettingsButton(false);
  };

  return (
    <>
      {showSettings ? (
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Configurar casaOS</Text>
              <Text style={styles.subtitle}>Conecte-se ao seu servidor casaOS</Text>
            </View>
            
            <View style={styles.formContainer}>
              <Text style={styles.label}>URL do Servidor casaOS:</Text>
              <TextInput
                style={styles.input}
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="ex: http://192.168.1.100:8080"
                placeholderTextColor="#999"
                autoCapitalize="none"
                keyboardType="url"
              />
              
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={saveUrl}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? "Conectando..." : "Conectar"}
                </Text>
              </TouchableOpacity>
              
              {isLoading && <ActivityIndicator style={styles.loader} color="#007bff" size="large" />}
              
              {isConnected && (
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={() => setShowSettings(false)}
                >
                  <Text style={styles.secondaryButtonText}>Voltar para casaOS</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      ) : (
        <View style={styles.fullScreenContainer}>
          <StatusBar hidden={isConnected} />
          {!isConnected ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#007bff" />
              <Text style={styles.message}>Configurando conexão...</Text>
            </View>
          ) : (
            <View style={styles.webviewContainer}>
              <WebView
                source={{ uri: serverUrl }}
                style={styles.webview}
                onLoadStart={() => setIsWebViewLoading(true)}
                onLoadEnd={() => {
                  setIsWebViewLoading(false);
                  showSettingsButtonTemporarily();
                }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={false}
                mixedContentMode="compatibility"
                allowsBackForwardNavigationGestures
                userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
              />
              
              {isWebViewLoading && (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color="#ffffff" />
                </View>
              )}
              
              {showSettingsButton && (
                <TouchableOpacity 
                  style={styles.floatingButton} 
                  onPress={openSettings}
                >
                  <Text style={styles.floatingButtonText}>⚙️</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  message: {
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
    color: '#333',
  },
  webviewContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#b3d7ff',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginTop: 20,
    alignSelf: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 10,
  },
  floatingButtonText: {
    fontSize: 24,
  },
});