import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import { Check, RefreshCw, RotateCcw, Sparkles, Volume2 } from "lucide-react";
import { getLeitnerBox, LEITNER_MAX_BOX } from "../../constants/leitner";
import "./Flashcard3D.css";

/* Sample card so the component renders standalone. Shape follows the Flashcard model
   (word, definition, example, pronunciation, box) plus optional partOfSpeech and tip. */
const SAMPLE_CARD = {
  _id: "sample-card",
  word: "perseverance",
  pronunciation: "/ˌpɜː.sɪˈvɪə.rəns/",
  partOfSpeech: "noun",
  definition: "Sự kiên trì, bền bỉ theo đuổi mục tiêu dù gặp khó khăn",
  example: "Her perseverance paid off when she finally passed the IELTS exam.",
  tip: "Collocation: show perseverance, sheer perseverance",
  box: 2,
};

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* Highlights the target word (and simple inflections like -s, -ed, -ing) inside the example. */
const HighlightedExample = React.memo(({ text, word }) => {
  const parts = useMemo(() => {
    if (!word) return [text];
    const re = new RegExp(`(\\b${escapeRegExp(word)}\\w*)`, "gi");
    return text.split(re);
  }, [text, word]);

  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="fc3d-mark">
        {part}
      </strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
});

const useSpeech = () => {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = useCallback(
    (text) => {
      if (!supported || !text) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      utter.rate = 0.9;
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(utter);
    },
    [supported]
  );

  useEffect(() => () => supported && window.speechSynthesis.cancel(), [supported]);

  return { speak, speaking, supported };
};

const Flashcard3D = ({ card = SAMPLE_CARD, onForget, onRemember, disabled = false }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { speak, speaking, supported } = useSpeech();

  const boxInfo = getLeitnerBox(card?.box);
  const isMaxBox = boxInfo.box >= LEITNER_MAX_BOX;

  // Show the front again whenever a new card is passed in
  useEffect(() => setIsFlipped(false), [card?._id, card?.word]);

  const toggleFlip = useCallback(() => setIsFlipped((f) => !f), []);

  const handleKeyDown = (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleFlip();
    }
  };

  const handleSpeak = (e) => {
    e.stopPropagation();
    speak(card.word);
  };

  if (!card) return null;

  const styleVars = {
    "--box-color": boxInfo.color,
    "--box-soft": boxInfo.soft,
    "--box-text": boxInfo.text,
  };

  return (
    <div className="fc3d" style={styleVars}>
      <div
        className={`fc3d-scene${isFlipped ? " is-flipped" : ""}`}
        role="button"
        tabIndex={0}
        aria-pressed={isFlipped}
        aria-label={
          isFlipped
            ? `Mặt sau thẻ ${card.word}: ${card.definition}. Nhấn để lật lại`
            : `Thẻ từ vựng ${card.word}. Nhấn để xem nghĩa`
        }
        onClick={toggleFlip}
        onKeyDown={handleKeyDown}
      >
        <div className="fc3d-inner">
          {/* ---------- Front ---------- */}
          <div className="fc3d-face fc3d-front" aria-hidden={isFlipped}>
            <div className="fc3d-topbar">
              <span className="fc3d-box-badge">
                <span className="fc3d-box-dot" aria-hidden="true" />
                Hộp {boxInfo.box} - {boxInfo.intervalLabel}
              </span>
              {supported && (
                <button
                  type="button"
                  className={`fc3d-audio${speaking ? " is-speaking" : ""}`}
                  onClick={handleSpeak}
                  aria-label={`Nghe phát âm từ ${card.word}`}
                  tabIndex={isFlipped ? -1 : 0}
                >
                  <Volume2 size={20} aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="fc3d-center">
              <h3 className="fc3d-word">{card.word}</h3>
              <div className="fc3d-ipa-row">
                {card.pronunciation && <span className="fc3d-ipa">{card.pronunciation}</span>}
                {card.partOfSpeech && <span className="fc3d-pos">{card.partOfSpeech}</span>}
              </div>
            </div>

            <div className="fc3d-hint">Nhấp vào thẻ để lật xem nghĩa ↻</div>
          </div>

          {/* ---------- Back ---------- */}
          <div className="fc3d-face fc3d-back" aria-hidden={!isFlipped}>
            <div className="fc3d-back-head">
              <span className="fc3d-back-word">
                {card.word}
                {card.partOfSpeech ? ` (${card.partOfSpeech})` : ""}
              </span>
              <RefreshCw size={14} color="var(--text-muted)" aria-hidden="true" />
            </div>

            <p className="fc3d-definition">{card.definition}</p>

            {card.example && (
              <p className="fc3d-example">
                <HighlightedExample text={card.example} word={card.word} />
              </p>
            )}

            {card.tip && (
              <div className="fc3d-tip">
                <Sparkles size={16} aria-hidden="true" />
                <span>{card.tip}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Actions ---------- */}
      <div className="fc3d-actions">
        <Button
          variant="outline-danger"
          className="fc3d-btn-forget px-4 py-2"
          onClick={() => onForget?.(card)}
          disabled={disabled}
        >
          <span className="fc3d-btn-label">
            <RotateCcw size={18} aria-hidden="true" />
            Chưa nhớ
          </span>
          <span className="fc3d-btn-sub">Reset Hộp 1</span>
        </Button>
        <Button
          variant="success"
          className="fc3d-btn-remember px-4 py-2"
          onClick={() => onRemember?.(card)}
          disabled={disabled}
        >
          <span className="fc3d-btn-label">
            <Check size={18} aria-hidden="true" />
            Đã thuộc
          </span>
          <span className="fc3d-btn-sub">
            {isMaxBox ? `Giữ Hộp ${LEITNER_MAX_BOX}` : `Lên Hộp ${boxInfo.box + 1}`}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default Flashcard3D;
