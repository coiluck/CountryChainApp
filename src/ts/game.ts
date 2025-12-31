// game.ts
import { settingsState } from './modules/userState';
import { getTranslatedText } from './modules/translation'
import { judgeAchievements } from './modules/judgeAchievements';

interface Country {
  enName: string;
  jaName: string;
  jaKana: string;
  neighbors: string[];
}

let countryMapData: object | null = null;

async function loadCountryMapData() {
  const response = await fetch('/json/country-map.json');
  if (!countryMapData) {
    countryMapData = await response.json();
  }
  return countryMapData;
}

let countryBorderData: object | null = null;

async function loadCountryBorderData() {
  const response = await fetch('/json/country-border.json');
  if (!countryBorderData) {
    countryBorderData = await response.json();
  }
  return countryBorderData;
}

// game state
let currentCountry: string = '';
let usedCountries = new Set<string>();
let isPlayerTurn: boolean = false;
let mistakes: number = 0;
let cpuMistakes: number = 0;
let countryCodes: string[] = [];

export async function startNewGame() {
  // チャットログを消去
  const chatLog = document.getElementById('game-chat-log') as HTMLElement;
  if (chatLog) {
    chatLog.innerHTML = '';
  }
  const userInput = document.getElementById('game-user-input') as HTMLInputElement;
  if (userInput) {
    userInput.value = '';
  }
  const inputSelectWrapper = document.getElementById('game-input-select-wrapper') as HTMLElement;
  if (inputSelectWrapper) {
    inputSelectWrapper.innerHTML = '';
  }
  // ゲーム変数の初期化
  usedCountries.clear();
  isPlayerTurn = false;
  mistakes = 0;
  cpuMistakes = 0;
  updateLife();
  await makeCountryData();
  // ゲームモードの設定
  if (settingsState.gameMode === 'normal') {
    const userInputContainer = document.querySelector('.game-input-container') as HTMLElement;
    if (userInputContainer) {
      userInputContainer.style.display = 'flex';
    }
    inputSelectWrapper.style.display = 'none';
  } else if (settingsState.gameMode === 'easy') {
    const userInputContainer = document.querySelector('.game-input-container') as HTMLElement;
    if (userInputContainer) {
      userInputContainer.style.display = 'none';
    }
    inputSelectWrapper.style.display = 'flex';
  }
  // 開始
  currentCountry = await getRandomCountry();
  usedCountries.add(currentCountry);

  const borderData = await loadCountryBorderData();
  if (borderData) {
    const countryData = (borderData as any)[currentCountry];
    const countryName = settingsState.lang === 'ja'
      ? countryData.jaName
      : countryData.enName;
    addMessage('gameStart', [countryName], 'system');
  } else {
    console.error("国境データの読み込みに失敗しました。");
  }
  computerTurn();
}

async function makeCountryData() {
  const countryBorder = await loadCountryBorderData();
  if (!countryBorder) {
    console.error('border json file not found');
    return;
  }
  countryCodes = Object.keys(countryBorder);
}

async function getRandomCountry() {
  const borderData = await loadCountryBorderData() as Record<string, Country>;

  // 除外したい国: イギリス、アイルランド、ハイチ、ドミニカ共和国、南アフリカ、イタリア
  const excludedSpecificCountries = ['GBR', 'IRL', 'HTI', 'DOM', 'ZAF', 'ITA'];

  let randomCode: string;
  let country: Country;

  do {
    const randomIndex = Math.floor(Math.random() * countryCodes.length);
    randomCode = countryCodes[randomIndex];
    country = borderData[randomCode];
  } while (country.neighbors.length === 0 || excludedSpecificCountries.includes(randomCode));

  return randomCode;
}

async function addMessage(textKey: string | null, params: string[], sender: string) {
  const chatLog = document.getElementById('game-chat-log') as HTMLElement;
  if (!chatLog) {
    console.error('chat log element not found');
    return;
  }
  const messageDiv = document.createElement('div');
  messageDiv.className = `game-message ${sender}-message`;

  let text;
  if (textKey) {
    text = await getTranslatedText(textKey, params); // paramsはnullだめ！
  } else {
    text = params[0]
  }
  const contentDiv = document.createElement('div');
  contentDiv.className = 'game-message-content';
  contentDiv.textContent = text || '';

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

  // easyモードなら一定確率で間違える
  if (settingsState.gameMode === 'easy') {
    const CPU_MISTAKE_RATE = 0.15;
    if (Math.random() < CPU_MISTAKE_RATE) {
      cpuMistakes++;

      if (cpuMistakes >= 3) {
        addMessage('gameWin', [], 'system');
        finishGame(true);
        return;
      }

      // 間違える国リスト
      const currentArea = getArea(currentCountry);
      let mistakeCandidates = countryCodes.filter(code =>
        getArea(code) === currentArea &&
        !usedCountries.has(code) &&
        code !== currentCountry &&
        !neighboringCountries.includes(code)
      );
      if (mistakeCandidates.length === 0) {
        mistakeCandidates = countryCodes.filter(code =>
          !usedCountries.has(code) &&
          code !== currentCountry &&
          !neighboringCountries.includes(code)
        );
      }
      if (mistakeCandidates.length === 0) {
        addMessage('gameWin', [], 'system');
        finishGame(true);
        return;
      }

      const wrongCountry = mistakeCandidates[Math.floor(Math.random() * mistakeCandidates.length)];
      const countryName = settingsState.lang === 'ja'
      ? borderData[wrongCountry].jaName
      : borderData[wrongCountry].enName;
      const currentCountryName = settingsState.lang === 'ja'
      ? borderData[currentCountry].jaName
      : borderData[currentCountry].enName;
      addMessage('computerTurn', [countryName], 'cpu');
      await new Promise<void>(resolve => setTimeout(resolve, 500));
      addMessage('gameNotNeighbor', [countryName, currentCountryName], 'system');
      addMessage('gameCPUMistake', [cpuMistakes.toString()], 'system');
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      computerTurn();
      return;
    }
  }

  if (neighboringCountries.length > 0) {
    const nextCountryIndex = Math.floor(Math.random() * neighboringCountries.length);
    const nextCountry = neighboringCountries[nextCountryIndex];

    // 状態更新
    currentCountry = nextCountry;
    usedCountries.add(currentCountry);

    const countryName = settingsState.lang === 'ja'
      ? borderData[currentCountry].jaName
      : borderData[currentCountry].enName;
    addMessage('computerTurn', [countryName], 'cpu');

    await renderMap(document.getElementById('game-chat-log') as HTMLElement, Array.from(usedCountries), currentCountry);

    // プレイヤーの負け判定
    const playerNeighbors = borderData[currentCountry]?.neighbors || [];
    const playerValidMoves = playerNeighbors.filter(neighborCode => {
      const isAllowed = countryCodes.includes(neighborCode);
      const isUnused = !usedCountries.has(neighborCode);
      return isAllowed && isUnused;
    });

    if (playerValidMoves.length === 0) {
      await addMessage('gameStuck', [], 'system');
      finishGame(false);
      return;
    }

    isPlayerTurn = true;
    if (settingsState.gameMode === 'easy') {
      showInputSelectForEasyMode();
    }
  } else {
    await addMessage('gameWin', [], 'system');
    finishGame(true);
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
    addMessage('gameNotInList', [answer], 'system');
    return;
  }

  const currentCountryObj = countryList[currentCountry];
  const currentCountryName = settingsState.lang === 'ja'
    ? currentCountryObj.jaName
    : currentCountryObj.enName;

  // ここからミス判定
  if (usedCountries.has(answerCode)) {
    mistakes++;
    updateLife();
    await addMessage('gameUsed', [answer], 'system');
    if (mistakes >= 3) {
      await addMessage('gameOver', [], 'system');
      finishGame(false, true);
      return;
    }
    return;
  } else if (!countryList[currentCountry].neighbors.includes(answerCode)) {
    mistakes++;
    updateLife();
    await addMessage('gameNotNeighbor', [answer, currentCountryName], 'system');
    if (mistakes >= 3) {
      await addMessage('gameOver', [], 'system');
      finishGame(false, true);
      return;
    }
    return;
  }
  // ここから正解判定
  usedCountries.add(answerCode);
  currentCountry = answerCode;
  isPlayerTurn = false;
  renderMap(document.getElementById('game-chat-log') as HTMLElement, Array.from(usedCountries), currentCountry);
  setTimeout(computerTurn, 2000);
}

async function sendMessage() {
  if (!isPlayerTurn) return;
  if (mistakes >= 3) return;
  const userInput = document.getElementById('game-user-input') as HTMLInputElement;
  let message: string = userInput.value.trim();
  if (message !== '') {
    message = message[0].toUpperCase() + message.slice(1);

    addMessage(null, [message], 'user');
    await playerTurn(message);
    userInput.value = '';
    // 変換候補を閉じる
    const suggestions = document.getElementById('game-suggestions-container');
    if (suggestions) {
      suggestions.style.display = 'none';
    }
  }
}

async function updateLife() {
  let life = document.getElementById('game-life') as HTMLElement;
  if (life) {
    life.textContent = await getTranslatedText('gameLife', []) || '';
  } else {
    life = document.createElement('div');
    life.id = 'game-life';
    life.textContent = await getTranslatedText('gameLife', []) || '';
    document.querySelector('.game-chat-container')?.appendChild(life);
  }

  const lifeIconContainer = document.createElement('div');
  lifeIconContainer.className = 'game-life-icon-container';
  for (let i = 0; i < 3 - mistakes; i++) {
    const lifeIcon = document.createElement('div');
    lifeIcon.className = 'game-life-icon';
    lifeIconContainer.appendChild(lifeIcon)
  }
  for (let i = 0; i < mistakes; i++) {
    const lifeIconLost = document.createElement('div');
    lifeIconLost.className = 'game-life-icon-lost';
    lifeIconContainer.appendChild(lifeIconLost)
  }
  life.appendChild(lifeIconContainer);
}

function finishGame(isWin: boolean, isShowResurrectButton: boolean = false) {
  // メッセージは追加済み
  isPlayerTurn = false;
  judgeAchievements(usedCountries, mistakes, isWin);
  showPlayAgainButton(isShowResurrectButton);
}

async function showPlayAgainButton(isShowResurrectButton: boolean = false) {
  const chatContainer = document.getElementById('game-chat-log') as HTMLElement;
  if (!chatContainer) {
    console.error('chat container not found');
    return;
  }

  const chatButtonContainer = document.createElement('div');
  chatButtonContainer.className = 'game-chat-button-container';
  chatContainer.appendChild(chatButtonContainer);

  if (isShowResurrectButton) {
    const resurrectButton = document.createElement('button');
    resurrectButton.className = 'game-resurrect-button game-chat-button fade-in';
    resurrectButton.textContent = await getTranslatedText('gameResurrect', []) || '';
    resurrectButton.addEventListener('click', () => {
      // 後で書く
    });
    chatButtonContainer.appendChild(resurrectButton);
  }

  const playAgainButton = document.createElement('button');
  playAgainButton.className = 'game-play-again-button game-chat-button fade-in';
  playAgainButton.textContent = await getTranslatedText('gamePlayAgain', []) || '';
  playAgainButton.addEventListener('click', () => {
    startNewGame();
  });
  chatButtonContainer.appendChild(playAgainButton);
  chatContainer.scrollTop = chatContainer.scrollHeight;
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
        item.setAttribute('tabindex', '0');

        const isEnglishMatch = country.enName.toLowerCase().includes(inputLower);
        const displayName = isEnglishMatch ? country.enName : country.jaName;

        item.textContent = displayName;
        item.onclick = function() {
          userInput.value = displayName;
          suggestionsContainer.style.display = 'none';
          userInput.focus();  // フォーカスを戻す
        };
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            item.click();
          }
        });
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

import { getArea, getRandomCountryFromArea } from './modules/countryAreaData';

async function showInputSelectForEasyMode() {
  const inputSelectWrapper = document.getElementById('game-input-select-wrapper') as HTMLElement;
  if (!inputSelectWrapper) {
    console.error('input select container not found');
    return;
  }
  inputSelectWrapper.innerHTML = '';

  const inputSelectContainer = document.createElement('div');
  inputSelectContainer.className = 'game-input-select-container';
  inputSelectWrapper.appendChild(inputSelectContainer);

  const borderData = await loadCountryBorderData() as Record<string, Country>;
  const suggestionList:string[] = [];
  // 接している国を二つランダムに抽出
  const validNeighbors = borderData[currentCountry].neighbors.filter(code => !usedCountries.has(code));
  if (validNeighbors.length > 0) {
    const shuffledNeighbors = validNeighbors.sort(() => Math.random() - 0.5);
    const numToAdd = Math.min(2, shuffledNeighbors.length); // 最大2つ
    for (let i = 0; i < numToAdd; i++) {
      suggestionList.push(shuffledNeighbors[i]);
    }
  }
  // 同じ地域の国を三つ抽出
  const area = getArea(currentCountry);
  if (area) {
    let count = 0;
    let safety = 0; // 無限ループ防止
    while (count < 3 && safety < 50) {
      const candidate = getRandomCountryFromArea(area);
      if (candidate &&
          !suggestionList.includes(candidate) &&
          !usedCountries.has(candidate) &&
          candidate !== currentCountry &&
          borderData[candidate]) {
        suggestionList.push(candidate);
        count++;
      }
      safety++;
    }
  }
  // ランダムな国を二つ抽出
  let count = 0;
  let safety = 0;
  while (count < 2 && safety < 100) {
    const randomIndex = Math.floor(Math.random() * countryCodes.length);
    const candidate = countryCodes[randomIndex];
    if (candidate &&
        !suggestionList.includes(candidate) &&
        !usedCountries.has(candidate) &&
        candidate !== currentCountry) {
      suggestionList.push(candidate);
      count++;
    }
    safety++;
  }

  // リストをシャッフル
  const shuffledList = suggestionList.sort(() => Math.random() - 0.5);

  for (const country of shuffledList) {
    const item = document.createElement('div');
    item.className = 'game-select-item';
    item.setAttribute('tabindex', '0');
    const countryName = settingsState.lang === 'ja'
      ? borderData[country].jaName
      : borderData[country].enName;
    item.textContent = countryName;
    item.addEventListener('click', () => {
      if (!isPlayerTurn) return;
      addMessage(null, [countryName], 'user');
      playerTurn(countryName);
    });
    inputSelectContainer.appendChild(item);
  }
}


import * as d3 from 'd3';

interface GeoJSONData {
  type: "FeatureCollection";
  features: any[];
}

// borderのほうにあってmapのほうにない国リスト
const MISSING_COORDS: Record<string, [number, number]> = {
  "AND": [1.52, 42.50],   // Andorra
  "ATG": [-61.85, 17.12], // Antigua and Barbuda
  "BHR": [50.55, 26.06],  // Bahrain
  "BRB": [-59.54, 13.19], // Barbados
  "COM": [43.33, -11.64], // Comoros
  "CPV": [-24.01, 16.00], // Cape Verde
  "DMA": [-61.37, 15.41], // Dominica
  "FSM": [158.15, 6.92],  // Micronesia
  "GRD": [-61.67, 12.11], // Grenada
  "KIR": [-157.36, 1.87], // Kiribati (Christmas Island付近)
  "KNA": [-62.78, 17.35], // Saint Kitts and Nevis
  "LCA": [-60.97, 13.90], // Saint Lucia
  "LIE": [9.55, 47.16],   // Liechtenstein
  "MCO": [7.42, 43.73],   // Monaco
  "MDV": [73.22, 3.20],   // Maldives
  "MHL": [171.18, 7.13],  // Marshall Islands
  "MLT": [14.45, 35.93],  // Malta
  "MUS": [57.55, -20.34], // Mauritius
  "NRU": [166.93, -0.52], // Nauru
  "PLW": [134.58, 7.51],  // Palau
  "SGP": [103.81, 1.35],  // Singapore
  "SMR": [12.45, 43.94],  // San Marino
  "STP": [6.61, 0.18],    // Sao Tome and Principe
  "SYC": [55.49, -4.67],  // Seychelles
  "TON": [-175.19, -21.17], // Tonga
  "TUV": [179.14, -8.51], // Tuvalu
  "VAT": [12.45, 41.90],  // Vatican City
  "VCT": [-61.22, 13.25], // Saint Vincent and the Grenadines
  "WSM": [-172.10, -13.75] // Samoa
};

async function renderMap(container: HTMLElement, coloredCountries: string[], lastCountry: string | null) {
  if (settingsState.mapDisplay === false) {
    return;
  }
  const data = await loadCountryMapData() as GeoJSONData;

  const width = (container.clientWidth - 20 * 2) * 0.8 || 800; // 左右のpadding, 0.8はテキトー
  const height = width * 1 / 2 || 500;

  // SVGの作成
  const svg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background-color", "var(--bg-bright)")
    .style("display", "block");

  const projection = d3.geoMercator()
    .fitSize([width, height], data);

  const pathGenerator = d3.geoPath().projection(projection);

  const mapGroup = svg.append("g").attr("id", "map-group");

  // 地図の描画と色塗り
  mapGroup.selectAll("path")
    .data(data.features)
    .enter()
    .append("path")
    .attr("d", pathGenerator)
    .attr("id", (d: any) => d.id)
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("fill", (d: any) => getColor(d.id));

  // 履歴にある or 現在の国 or ゲームオーバー国だけをフィルタリング
  /* const missingTargets = Object.keys(MISSING_COORDS).filter(id =>
    id === currentCountry || id === lastCountry || coloredCountries.includes(id)
  ); */
  const missingTargets = Object.keys(MISSING_COORDS)

  mapGroup.selectAll("circle.missing-country")
    .data(missingTargets)
    .enter()
    .append("circle")
    .attr("class", "missing-country")
    .attr("cx", d => {
      const coords = MISSING_COORDS[d];
      return projection(coords)?.[0] || 0;
    })
    .attr("cy", d => {
      const coords = MISSING_COORDS[d];
      return projection(coords)?.[1] || 0;
    })
    .attr("r", 0.3) // 点の国のサイズ, (* 10) pxに拡大
    .attr("stroke", "black")
    .attr("stroke-width", 0.1) // 点のまわりの黒
    .attr("fill", d => getColor(d));

  // zoom設定
  if (settingsState.mapDisplay === true && lastCountry !== null) {
    let transform = d3.zoomIdentity; // デフォルトは1
    const MAX_ZOOM = 10;
    const targetFeature = data.features.find((f: any) => f.id === currentCountry);

    if (targetFeature) {
      const bounds = pathGenerator.bounds(targetFeature);
      const dx = bounds[1][0] - bounds[0][0];
      const dy = bounds[1][1] - bounds[0][1];
      const x = (bounds[0][0] + bounds[1][0]) / 2;
      const y = (bounds[0][1] + bounds[1][1]) / 2;

      const calcedScale = 0.6 / Math.max(dx / width, dy / height);
      const scale = Math.min(calcedScale, MAX_ZOOM);
      console.log(`拡大率: ${scale}`)

      const translate = [width / 2 - scale * x, height / 2 - scale * y];
      transform = d3.zoomIdentity
        .translate(translate[0], translate[1])
        .scale(scale);
    } else if (MISSING_COORDS[currentCountry]) {
      const coords = MISSING_COORDS[currentCountry]; // [lon, lat]
      const projected = projection(coords);          // [x, y]

      if (projected) {
        const [x, y] = projected;
        const scale = MAX_ZOOM;

        const translate = [width / 2 - scale * x, height / 2 - scale * y];
        transform = d3.zoomIdentity
          .translate(translate[0], translate[1])
          .scale(scale);
      }
    }
    mapGroup.transition().duration(750)
      .attr("transform", transform.toString());

    mapGroup.selectAll("path")
      .attr("stroke", "black")
      .attr("stroke-width", 1 / transform.k);
  }
  function getColor(id: string): string {
    if (id === lastCountry) return "#FF4444"; // 今の国
    if (coloredCountries.includes(id)) return "#cccccc"; // 履歴
    return "white";
  }
  const chatLog = document.getElementById('game-chat-log') as HTMLElement;
  chatLog.scrollTop = chatLog.scrollHeight;
}

document.getElementById('game-user-input')?.addEventListener('input', showSuggestions);
document.getElementById('game-user-input')?.addEventListener('keydown', (e) => {
  const suggestionsContainer = document.getElementById('game-suggestions-container');
  const isSuggestionsVisible = suggestionsContainer &&
                               suggestionsContainer.style.display !== 'none' &&
                               suggestionsContainer.children.length > 0;
  if (e.key === 'Tab' && isSuggestionsVisible && !e.shiftKey) {
    e.preventDefault();
    const firstItem = suggestionsContainer.firstElementChild as HTMLElement;
    if (firstItem) {
      firstItem.focus();
    }
    return;
  }
  if (e.key === 'Enter') {
    sendMessage();
  }
});
document.getElementById('game-send-button')?.addEventListener('click', () => {
  sendMessage();
  const userInput = document.getElementById('game-user-input') as HTMLInputElement;
  if (userInput) {
    userInput.focus();
  }
});

import { changeModal } from './modules/changeModal';

document.querySelector('.button-container .top-button')?.addEventListener('click', () => {
  changeModal('top', null, 500, true);
  judgeAchievements(usedCountries, mistakes, false);
});