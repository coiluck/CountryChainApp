// about.ts
export async function setUpAbout() {
  const aboutContent = document.querySelector('.about-container') as HTMLElement;
  if (!aboutContent) return;
  aboutContent.innerHTML = '';
  aboutContent.innerHTML = await generateAboutContent();
}

import { settingsState } from './modules/userState';

async function generateAboutContent(): Promise<string> {
  const userLang = settingsState.lang as 'ja' | 'en';
  if (userLang === 'ja') {
    return `
<p>国境しりとりは、地図上で陸続き（国境を接する）になっている国を順番に答えてつなげていく対戦ゲームです。コンピュータと交互に回答していき、相手が答えられなくなった方が勝利となります。</p>

<h2>ゲームの流れ</h2>
<ul>
  <li>コンピュータが最初の国を提示します。</li>
  <li>プレイヤーは、その国と「陸続きで隣接する」国を一つ答えます（既出の国は使えません）。</li>
  <li>次にコンピュータが、プレイヤーが直前に答えた国の隣接国を一つ答えます。</li>
  <li>以後、交互に隣接する未使用の国を答えていきます。<br>
  （例：韓国 → 北朝鮮 → 中国 のように陸続きで進む）</li>
</ul>

<h2>勝敗条件</h2>

<h3>プレイヤーの敗北（ゲームオーバー）</h3>
<ul>
  <li>プレイヤーが以下のミスを合計3回犯すと敗北になります：
    <ul>
      <li>隣接していない国を答えた</li>
      <li>すでに使用された国を答えた</li>
    </ul>
  </li>
</ul>

<h3>プレイヤーの勝利</h3>
<ul>
  <li>コンピュータが答えられる隣接国がなくなり（詰みになり）コンピュータが回答不能になった場合、プレイヤーの勝利です。</li>
  <li>Easyモードではコンピュータが誤答する確率があり、コンピュータが合計3回間違えた場合もプレイヤーの勝利になります（Easyモードの誤答確率は20%）。</li>
</ul>

<h2>操作方法</h2>

<h3>Easy モード</h3>
<ul>
  <li>複数の候補（選択肢）が画面に表示されます。</li>
  <li>表示された中から1つ選んで送信してください。</li>
</ul>

<h3>Normal モード</h3>
<ul>
  <li>画面の入力欄に国名を入力します（日本語・英語どちらも可）。</li>
  <li>入力中に候補が表示されます。候補リストから選択して送信してください。</li>
</ul>

<h2>使用できる国</h2>
<ul>
  <li>基本的には国連加盟国に準拠しますが、ゲームでは以下の例のような地域・準国家も使用できます：
    <ul>
      <li>西サハラ、パレスチナ</li>
      <li>グリーンランド、フランス領ギアナ</li>
      <li>アンドラ、サンマリノ、バチカン市国、モナコ 等の小国</li>
    </ul>
  </li>
  <li>細かい扱いや境界の判断はゲーム内のマップ上でご確認ください。</li>
</ul>

<h2>ミッションと報酬</h2>
<ul>
  <li>デイリーミッションや実績を達成すると経験値（EXP）を獲得できます。</li>
  <li>経験値が一定量たまるとプレイヤーレベルが上がり、カラーテーマ、フォント、背景BGMなどのカスタマイズ要素がアンロックされます。</li>
  <li>デイリーミッションは午前4時に更新されます。</li>
</ul>
    `;
  } else {
    return `
<p>Country Chain is a competitive game in which players take turns naming countries that are connected by land (i.e., share a border) on the map. The player and the computer answer alternately, and the side that can no longer provide a valid answer loses.</p>

<h2>Game Flow</h2>
<ul>
  <li>The computer starts with the first country.</li>
  <li>The player names a country that is “land-connected and adjacent” to that country (previously used countries are not allowed).</li>
  <li>Next, the computer answers with one country adjacent to the country most recently given by the player.</li>
  <li>Thereafter, both sides alternately answer with unused adjacent countries.<br>
  (Example: Canada → United States → Mexico, progressing through land connections)</li>
</ul>

<h2>Win/Loss Conditions</h2>

<h3>Player Defeat (Game Over)</h3>
<ul>
  <li>It is Game Over if the player makes a total of three mistakes:
    <ul>
      <li>Answering a country that is not adjacent</li>
      <li>Answering a country that has already been used</li>
    </ul>
  </li>
</ul>

<h3>Player Victory</h3>
<ul>
  <li>If the computer has no adjacent country it can answer (i.e., reaches a dead end) and becomes unable to respond, the player wins.</li>
  <li>In Easy mode, the computer has a chance to make incorrect answers. If the computer makes a total of three mistakes, the player also wins (the error probability in Easy mode is 20%).</li>
</ul>

<h2>Controls</h2>

<h3>Easy Mode</h3>
<ul>
  <li>Multiple candidates (choices) are displayed on the screen.</li>
  <li>Select one of the displayed options and submit it.</li>
</ul>

<h3>Normal Mode</h3>
<ul>
  <li>Enter a country name in the input field on the screen.</li>
  <li>Candidate suggestions are displayed while typing. Select one from the list and submit it.</li>
</ul>

<h2>Available Countries</h2>
<ul>
  <li>In principle, the game follows United Nations member states, but regions and territories such as the following can also be used:
    <ul>
      <li>Western Sahara, Palestine</li>
      <li>Greenland, French Guiana</li>
      <li>Small states such as Andorra, San Marino, Vatican City, Monaco, etc.</li>
    </ul>
  </li>
  <li>For detailed handling and boundary judgments, please refer to the in-game map.</li>
</ul>

<h2>Missions and Rewards</h2>
<ul>
  <li>By completing daily missions and achievements, players can earn experience points (EXP).</li>
  <li>When enough EXP is accumulated, the player level increases, unlocking customization options such as color themes, fonts, and background music.</li>
  <li>Daily missions are updated at 4:00 a.m.</li>
</ul>
    `;
  }
}