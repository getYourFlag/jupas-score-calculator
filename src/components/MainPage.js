import React from "react";
import "./MainPage.css";

const MainPage = props => {
    return (
        <React.Fragment>
            <div className="MainPage">
                <h3>一個安全、快速、準確的升學計分器</h3>
                <p>歡迎使用升學計分器。各位使用者可以透過本站，迅速找到較大機會入讀的大學學科。</p>
                <p>現時計算器可計算以下課程入學機率：</p>
                <ul>
                    <li>八間教資會資助大學之學士課程</li>
                    <li>香港公開大學經聯招收生之自資課程</li>
                    <li>「指定專業／界別課程資助計劃」（SSSDP）經聯招收生之課程</li>
                </ul>
                <p>各位可點擊網頁右上角「輸入成績」連結，即可轉入計算器畫面。如使用者在先前曾輸入成績，則可直接進入「計算結果」一頁查看結果。</p>
                <p>請注意，計算器所提供的入學機率並不代表入學的實際機率。院校在收生時，或會考慮面試、校長推薦、隨申請呈交之個人作品集等各項因素，從而影響個別學生能否入讀該課程。</p>
                <p>大學選科乃人生大事，本計算器於開發時，秉承開放、透明的原則。計算器的演算法和資料來源均全數公開，各位可至「演算法說明」一頁查閱。本計算器的GitHub頁面上亦有詳列此等資料。</p>
            </div>
            <div className="MainPage">
                <h3>資料來源</h3>
                <p>本程式在開發時，<strong>只使用公開之資料</strong>，以便公眾了解本計算器的演算法及判斷可靠程度。本計算器於開發時所使用的參考資料包括：</p>
                <ul>
                    <li>聯招網站所提供的學科入學資訊及各院校往年收生分數</li>
                    <li>相關大學的網站上提供的學科資訊、計分方式及往年收生分數</li>
                </ul>
                <p>本程式暫不考慮使用非公開的資料，因為：</p>
                <ul>
                    <li>公眾人士無法查證該等資料的真偽及可靠性</li>
                    <li>此類非公開的資料包括各院校之自訂規則，或會因時而變，以致演算法隨時變得不可靠。</li>
                </ul>
                <hr></hr>
                <h3>資料收集</h3>
                <p>各學科資料均已儲存在網頁內，計算成績時毋須連接外部伺服器，使用者所輸入之成績將不會傳送至其他伺服器。</p>
                <p>本計算器使用Google Analytics收集使用者數量及時間等。</p>
                <p>如有疑慮，歡迎至本站GitHub專案處查看原始碼。</p>
            </div>
        </React.Fragment>
    );
}

export default MainPage;