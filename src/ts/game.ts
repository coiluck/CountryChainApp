// game.ts
import { settingsState } from './modules/userState';

interface Country {
  enName: string;
  jaName: string;
  jaKana: string;
  neighbors: string[];
}

let countryMapData: object | null = null;

async function loadCountryMapData() {
  const response = await fetch('./src/json/country-map.json');
  if (!countryMapData) {
    countryMapData = await response.json();
  }
  return countryMapData;
}

let countryBorderData: object | null = null;

async function loadCountryBorderData() {
  const response = await fetch('./src/json/country-border.json');
  if (!countryBorderData) {
    countryBorderData = await response.json();
  }
  return countryBorderData;
}

// game state
let currentCountry: string = '';
let usedCountries = new Set();
let isPlayerTurn: boolean = false;
let mistakes: number = 0;
let countryCodes: string[] = [];

async function startNewGame() {
  // チャットログを消去
  const chatLog = document.getElementById('game-chat-log') as HTMLElement;
  if (chatLog) {
    chatLog.innerHTML = '';
  }
  // ゲーム変数の初期化
  usedCountries.clear();
  isPlayerTurn = false;
  mistakes = 0;
  await makeCountryData();
  // 開始
  currentCountry = await getRandomCountry();
  usedCountries.add(currentCountry);

  const borderData = await loadCountryBorderData();
  if (borderData) {
    const countryName = (borderData as any)[currentCountry].jaName;
    addMessage(`ゲームを開始します。最初の国は${countryName}です。`, 'system');
  } else {
    console.error("国境データの読み込みに失敗しました。");
  }
  computerTurn();
}

// これはゲーム開始ボタンに設定する
// 後で書く
startNewGame();

async function makeCountryData() {
  const countryBorder = await loadCountryBorderData();
  if (!countryBorder) {
    console.error('border json file not found');
    return;
  }
  countryCodes = Object.keys(countryBorder);
  // 除外設定を適用
  // 後で書く
}

async function getRandomCountry() {
  const borderData = await loadCountryBorderData() as Record<string, Country>;

  // 除外したい国: イギリス、アイルランド、ハイチ、ドミニカ共和国
  const excludedSpecificCountries = ['GBR', 'IRL', 'HTI', 'DOM'];

  let randomCode: string;
  let country: Country;

  do {
    const randomIndex = Math.floor(Math.random() * countryCodes.length);
    randomCode = countryCodes[randomIndex];
    country = borderData[randomCode];
  } while (country.neighbors.length === 0 || excludedSpecificCountries.includes(randomCode));

  return randomCode;
}

function addMessage(text: string, sender: string) {
  const chatLog = document.getElementById('game-chat-log') as HTMLElement;
  if (!chatLog) {
    console.error('chat log element not found');
    return;
  }
  const messageDiv = document.createElement('div');
  messageDiv.className = `game-message ${sender}-message`;

  const contentDiv = document.createElement('div');
  contentDiv.className = 'game-message-content';
  contentDiv.textContent = text;

  messageDiv.appendChild(contentDiv);
  chatLog.appendChild(messageDiv);

  // 自動スクロール
  chatLog.scrollTop = chatLog.scrollHeight;
}

async function computerTurn() {
  // 使用されていない隣国をフィルタリング
  const countryList = await loadCountryBorderData();
  const borderData = countryList as { [key: string]: { enName: string, jaName: string, neighbors: string[] } };
  const rawNeighbors = borderData[currentCountry]?.neighbors || [];
  const neighboringCountries = rawNeighbors.filter(neighborCode => {
    const isAllowed = countryCodes.includes(neighborCode); // 国名リストに含まれている
    const isUnused = !usedCountries.has(neighborCode); // 使用されていない
    return isAllowed && isUnused;
  });
  if (neighboringCountries.length > 0) {
    const nextCountryIndex = Math.floor(Math.random() * neighboringCountries.length);
    const nextCountry = neighboringCountries[nextCountryIndex];

    // 状態更新
    currentCountry = nextCountry;
    usedCountries.add(currentCountry);

    const countryName = borderData[currentCountry].jaName;
    addMessage(`コンピュータ: ${countryName}`, 'cpu');

    isPlayerTurn = true;
  } else {
    addMessage('コンピュータが言える国がなくなりました。プレイヤーの勝利です！', 'system');
  }
}

async function playerTurn(answer: string) {
  if (!isPlayerTurn) return;

  const rawData = await loadCountryBorderData();
  const countryList = rawData as Record<string, Country>
  const answerCode = Object.keys(countryList).find(key => {
    const country = countryList[key];
    return country.enName === answer || country.jaName === answer || country.jaKana === answer;
  });

  if (!answerCode) {
    addMessage(`${answer}はリストに存在しません。変換候補を使用してもう一度試してください。`, 'system');
    return;
  }

  const currentCountryObj = countryList[currentCountry];
  const currentCountryName = settingsState.lang === 'ja'
    ? currentCountryObj.jaName
    : currentCountryObj.enName;

  // ここからミス判定
  if (usedCountries.has(answerCode)) {
    mistakes++;
    addMessage(`${answer}は既に使用されています。`, 'system');
    if (mistakes >= 2) {
      addMessage(`2回連続で間違えたためゲームオーバーです！`, 'system');
      // ゲームオーバー処理
      return;
    }
    return;
  } else if (!countryList[currentCountry].neighbors.includes(answerCode)) {
    mistakes++;
    addMessage(`${answer}は${currentCountryName}に隣接していません。`, 'system');
    if (mistakes >= 2) {
      addMessage(`2回連続で間違えたためゲームオーバーです！`, 'system');
      // ゲームオーバー処理
      return;
    }
    return;
  }
  // ここから正解判定
  mistakes = 0;
  usedCountries.add(answerCode);
  currentCountry = answerCode;
  isPlayerTurn = false;
  setTimeout(computerTurn, 1000);
}

function sendMessage() {
  const userInput = document.getElementById('game-user-input') as HTMLInputElement;
  let message: string = userInput.value.trim();
  if (message !== '') {
    message = message[0].toUpperCase() + message.slice(1);

    addMessage(message, 'user');
    playerTurn(message);
    userInput.value = '';
    // 変換候補を閉じる
    const suggestions = document.getElementById('game-suggestions-container');
    if (suggestions) {
      suggestions.style.display = 'none';
    }
  }
}

function showSuggestions() {
  const userInput = document.getElementById('game-user-input') as HTMLInputElement;
  const suggestionsContainer = document.getElementById('game-suggestions-container');

  // 要素がない場合やデータがまだ読み込まれていない場合は中断
  if (!userInput || !suggestionsContainer || !countryBorderData) {
    return;
  }

  // 入力値を取得
  const input = userInput.value.trim();
  const inputLower = input.toLowerCase(); // 英語検索用

  if (input.length > 0) {
    const borderData = countryBorderData as Record<string, Country>;
    const suggestions = Object.values(borderData).filter((country: Country) => {
      return (
        country.jaName.includes(input) ||
        country.jaKana.includes(input) ||
        country.enName.toLowerCase().includes(inputLower)
      );
    });

    if (suggestions.length > 0) {
      suggestionsContainer.innerHTML = '';

      suggestions.forEach((country: Country) => {
        const item = document.createElement('div');
        item.className = 'game-suggestion-item';

        const isEnglishMatch = country.enName.toLowerCase().includes(inputLower);
        const displayName = isEnglishMatch ? country.enName : country.jaName;

        item.textContent = displayName;
        item.onclick = function() {
          userInput.value = displayName;
          suggestionsContainer.style.display = 'none';
          userInput.focus();  // フォーカスを戻す
        };
        suggestionsContainer.appendChild(item);
      });
      suggestionsContainer.style.display = 'block';
    } else {
      // 候補がない
      suggestionsContainer.style.display = 'none';
    }
  } else {
    // 入力がない
    suggestionsContainer.style.display = 'none';
  }
}

document.getElementById('game-user-input')?.addEventListener('input', showSuggestions);
document.getElementById('game-user-input')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});
document.getElementById('game-send-button')?.addEventListener('click', sendMessage);