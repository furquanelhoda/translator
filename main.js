const API_KEY = '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';
    const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

    const sourceLang = document.getElementById('sourceLang');
    const targetLang = document.getElementById('targetLang');
    const sourceText = document.getElementById('sourceText');
    const translatedText = document.getElementById('translatedText');
    const swapButton = document.getElementById('swapLanguages');
    const copyButton = document.getElementById('copyButton');

    const languages = [
      { code: 'en', name: 'English' },
      { code: 'ar', name: 'Arabic' },
      { code: 'zh', name: 'Chinese' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'hi', name: 'Hindi' },
      { code: 'it', name: 'Italian' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'es', name: 'Spanish' }
    ];

    function populateLanguageSelects() {
      languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.code;
        option.textContent = lang.name;
        targetLang.appendChild(option.cloneNode(true));
        if (lang.code !== 'auto') {
          sourceLang.appendChild(option);
        }
      });
    }

    async function translateText() {
      const text = sourceText.value.trim();
      if (!text) {
        translatedText.value = '';
        return;
      }

      const source = sourceLang.value;
      const target = targetLang.value;

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'HTTP-Referer': window.location.href,
            'X-Title': 'Translation App'
          },
          body: JSON.stringify({
            model: 'openai/gpt-3.5-turbo',
            messages: [{
              role: 'user',
              content: `Translate the following text from ${source === 'auto' ? 'its detected language' : source} to ${target}: ${text}`
            }]
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
          translatedText.value = data.choices[0].message.content;
        } else {
          throw new Error('Invalid response format from API');
        }
      } catch (error) {
        console.error('Translation error:', error);
        translatedText.value = `Error: ${error.message}`;
      }
    }

    function swapLanguages() {
      const temp = sourceLang.value;
      sourceLang.value = targetLang.value;
      targetLang.value = temp;
      translateText();
    }

    function copyTranslation() {
      translatedText.select();
      document.execCommand('copy');
    }

    // Add debounce to prevent too many API calls
    let debounceTimer;
    function debounceTranslate() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(translateText, 500);
    }

    sourceText.addEventListener('input', debounceTranslate);
    swapButton.addEventListener('click', swapLanguages);
    copyButton.addEventListener('click', copyTranslation);
    sourceLang.addEventListener('change', translateText);
    targetLang.addEventListener('change', translateText);

    // Initialize
    populateLanguageSelects();
    sourceLang.value = 'auto';
    targetLang.value = 'en';
