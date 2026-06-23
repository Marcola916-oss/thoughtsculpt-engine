/* eslint-disable react/no-unknown-property */
/**
 * Phase C — Template editorial do diagnóstico (PDF / @react-pdf/renderer).
 * Estilo: revista/zine premium. Tipografia massiva atrás de objeto, grid técnica,
 * duotone cor-do-arquétipo × creme × vermelho-marca. 14 páginas A4.
 */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Diagnosis } from "@/lib/ai/diagnosis-schema";
import type { ArchetypeCode } from "@/lib/ai/diagnosis-schema";
import { ARCHETYPE_NAMES, ARCHETYPE_TAGLINES } from "@/lib/ai/archetypes";
import {
  PDF_COLORS,
  PDF_TYPE,
  PDF_SPACING,
  ARCHETYPE_PALETTES,
  PDF_FONT_URLS,
  PDF_COPY,
  isRtl,
  type Lang,
} from "./tokens";

/* ────────────────────────────── Fonts ────────────────────────────── */
let fontsRegistered = false;
export function registerPdfFonts() {
  if (fontsRegistered) return;
  fontsRegistered = true;
  Font.register({
    family: "Inter",
    fonts: [
      { src: PDF_FONT_URLS.inter400, fontWeight: 400 },
      { src: PDF_FONT_URLS.inter600, fontWeight: 600 },
      { src: PDF_FONT_URLS.inter700, fontWeight: 700 },
    ],
  });
  Font.register({
    family: "Syne",
    fonts: [
      { src: PDF_FONT_URLS.syne700, fontWeight: 700 },
      { src: PDF_FONT_URLS.syne800, fontWeight: 800 },
    ],
  });
  Font.register({
    family: "NotoNaskhArabic",
    fonts: [
      { src: PDF_FONT_URLS.notoNaskh400, fontWeight: 400 },
      { src: PDF_FONT_URLS.notoNaskh700, fontWeight: 700 },
    ],
  });
  Font.registerHyphenationCallback((w) => [w]); // sem hifenização — editorial.
}

/* ────────────────────────────── Helpers ────────────────────────────── */
const TOTAL_PAGES = 14;

interface Props {
  name: string;
  archetype: ArchetypeCode;
  lang: Lang;
  areaScores: { money: number; career: number; love: number; personal: number };
  diagnosis: Diagnosis;
}

/* ────────────────────────────── Styles ────────────────────────────── */
const makeStyles = (lang: Lang, arch: ArchetypeCode) => {
  const pal = ARCHETYPE_PALETTES[arch];
  const bodyFont = isRtl(lang) ? "NotoNaskhArabic" : "Inter";
  const displayFont = isRtl(lang) ? "NotoNaskhArabic" : "Syne";

  return StyleSheet.create({
    /* Pages */
    pageDark: {
      backgroundColor: PDF_COLORS.ink,
      color: PDF_COLORS.paper,
      paddingHorizontal: PDF_SPACING.pageMarginX,
      paddingVertical: PDF_SPACING.pageMarginY,
      fontFamily: bodyFont,
      fontSize: PDF_TYPE.body,
      lineHeight: PDF_TYPE.leading,
    },
    pageLight: {
      backgroundColor: PDF_COLORS.paper,
      color: PDF_COLORS.ink,
      paddingHorizontal: PDF_SPACING.pageMarginX,
      paddingVertical: PDF_SPACING.pageMarginY,
      fontFamily: bodyFont,
      fontSize: PDF_TYPE.body,
      lineHeight: PDF_TYPE.leading,
    },
    /* Atoms */
    displayMega: {
      fontFamily: displayFont,
      fontWeight: 800,
      fontSize: PDF_TYPE.giantDisplay,
      letterSpacing: -4,
      lineHeight: 0.85,
    },
    hero: {
      fontFamily: displayFont,
      fontWeight: 800,
      fontSize: PDF_TYPE.hero,
      letterSpacing: -2,
      lineHeight: 0.92,
    },
    h1: {
      fontFamily: displayFont,
      fontWeight: 800,
      fontSize: PDF_TYPE.h1,
      letterSpacing: -1,
      lineHeight: 1,
    },
    h2: {
      fontFamily: displayFont,
      fontWeight: 700,
      fontSize: PDF_TYPE.h2,
      letterSpacing: -0.5,
      lineHeight: 1.08,
    },
    h3: { fontFamily: displayFont, fontWeight: 700, fontSize: PDF_TYPE.h3 },
    body: { fontFamily: bodyFont, fontWeight: 400 },
    bold: { fontFamily: bodyFont, fontWeight: 700 },
    tag: {
      fontFamily: bodyFont,
      fontWeight: 700,
      fontSize: PDF_TYPE.micro,
      letterSpacing: 3,
      textTransform: "uppercase",
    },
    eyebrow: {
      fontFamily: bodyFont,
      fontWeight: 700,
      fontSize: PDF_TYPE.small,
      letterSpacing: 2.5,
      textTransform: "uppercase",
      color: PDF_COLORS.brand,
    },
    /* Page chrome */
    pageNumberDark: {
      position: "absolute",
      bottom: 24,
      right: 36,
      fontSize: PDF_TYPE.micro,
      letterSpacing: 1.5,
      color: PDF_COLORS.mute,
    },
    pageNumberLight: {
      position: "absolute",
      bottom: 24,
      right: 36,
      fontSize: PDF_TYPE.micro,
      letterSpacing: 1.5,
      color: PDF_COLORS.ink,
      opacity: 0.5,
    },
    sideTagDark: {
      position: "absolute",
      top: 32,
      left: 16,
      fontSize: PDF_TYPE.micro,
      letterSpacing: 2,
      color: PDF_COLORS.brand,
      transform: "rotate(-90deg)",
      transformOrigin: "0 0",
    },
    sideTagLight: {
      position: "absolute",
      top: 32,
      left: 16,
      fontSize: PDF_TYPE.micro,
      letterSpacing: 2,
      color: PDF_COLORS.brand,
      transform: "rotate(-90deg)",
      transformOrigin: "0 0",
    },
    gridOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: "row",
      opacity: 0.12,
    },
    gridCol: { flex: 1, borderLeft: `0.4pt solid ${PDF_COLORS.gridLine}` },
    /* Cover wash */
    coverWash: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: pal.primary,
      opacity: 0.45,
    },
    coverInk: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: PDF_COLORS.ink,
    },
    coverGiantBg: {
      position: "absolute",
      top: 80,
      left: -30,
      right: -30,
      color: pal.secondary,
      opacity: 0.22,
      fontFamily: displayFont,
      fontWeight: 800,
      fontSize: 240,
      letterSpacing: -8,
      lineHeight: 0.85,
    },
    /* Stamp */
    stamp: {
      borderWidth: 1,
      borderColor: PDF_COLORS.brand,
      color: PDF_COLORS.brand,
      paddingHorizontal: 10,
      paddingVertical: 4,
      fontSize: PDF_TYPE.micro,
      letterSpacing: 2,
      textTransform: "uppercase",
      alignSelf: "flex-start",
    },
    quoteRule: {
      borderLeft: `3pt solid ${PDF_COLORS.brand}`,
      paddingLeft: 14,
      marginVertical: 12,
    },
    /* Layout */
    twoCol: { flexDirection: "row", gap: PDF_SPACING.gridGutter, marginTop: 16 },
    col: { flex: 1 },
    /* Tables */
    row: {
      flexDirection: "row",
      borderBottom: `0.5pt solid ${PDF_COLORS.mute}`,
      paddingVertical: 8,
    },
    cellDay: { width: 60, fontFamily: displayFont, fontWeight: 800, fontSize: 14, color: PDF_COLORS.brand },
    cellMain: { flex: 1 },
    cellCue: { width: 130, fontSize: PDF_TYPE.small, color: PDF_COLORS.mute },
    scoreBarTrack: {
      height: 4,
      backgroundColor: PDF_COLORS.mute,
      opacity: 0.35,
      marginTop: 8,
    },
    scoreBarFill: {
      height: 4,
      backgroundColor: PDF_COLORS.brand,
    },
    chip: {
      backgroundColor: pal.primary,
      color: PDF_COLORS.white,
      paddingHorizontal: 8,
      paddingVertical: 3,
      fontSize: PDF_TYPE.micro,
      letterSpacing: 2,
      textTransform: "uppercase",
      alignSelf: "flex-start",
      borderRadius: 2,
    },
  });
};

const GridOverlay = () => (
  <View style={{
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    flexDirection: "row", opacity: 0.10,
  }} fixed>
    {Array.from({ length: 12 }).map((_, i) => (
      <View key={i} style={{ flex: 1, borderLeftWidth: 0.3, borderLeftColor: PDF_COLORS.mute }} />
    ))}
  </View>
);

/* ─────────────────────── The document ─────────────────────── */
export function DiagnosisDocument({ name, archetype, lang, areaScores, diagnosis }: Props) {
  registerPdfFonts();

  const s = makeStyles(lang, archetype);
  const copy = PDF_COPY[lang];
  const pal = ARCHETYPE_PALETTES[archetype];
  const archName = ARCHETYPE_NAMES[archetype][lang];
  const archTag = ARCHETYPE_TAGLINES[archetype][lang];
  const rtl = isRtl(lang);
  const dir = rtl ? ("rtl" as const) : ("ltr" as const);

  const ar = diagnosis.areas;
  const areaList: Array<{ k: keyof typeof ar; label: string; score: number }> = [
    { k: "money", label: copy.areas.money, score: areaScores.money },
    { k: "career", label: copy.areas.career, score: areaScores.career },
    { k: "love", label: copy.areas.love, score: areaScores.love },
    { k: "personal", label: copy.areas.personal, score: areaScores.personal },
  ];

  return (
    <Document
      title={`MindReset — ${archName}`}
      author="MindReset"
      subject="Diagnóstico comportamental"
      creator="MindReset"
      producer="MindReset"
    >
      {/* ── 01 CAPA ───────────────────────────────────────────── */}
      <Page size="A4" style={{ ...s.pageDark, padding: 0 }}>
        <View style={s.coverInk} />
        <View style={s.coverWash} />
        <Text style={s.coverGiantBg}>{archName.toUpperCase()}</Text>
        <GridOverlay />
        <View style={{ paddingHorizontal: PDF_SPACING.pageMarginX, paddingVertical: PDF_SPACING.pageMarginY, height: "100%", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={[s.tag, { color: PDF_COLORS.brand }]}>{copy.edition}</Text>
            <Text style={[s.tag, { color: PDF_COLORS.paper }]}>№ 01 / {String(TOTAL_PAGES).padStart(2, "0")}</Text>
          </View>
          <View>
            <Text style={[s.eyebrow, { color: pal.accent }]}>{archetype} · {archTag}</Text>
            <Text style={[s.hero, { color: PDF_COLORS.paper, marginTop: 8 }]} hyphenationCallback={(w) => [w]}>
              {copy.diagnosisOf(name)}
            </Text>
            <View style={{ height: 2, width: 80, backgroundColor: PDF_COLORS.brand, marginVertical: 18 }} />
            <Text style={[s.body, { color: PDF_COLORS.paper, opacity: 0.75, maxWidth: 360 }]}>
              {copy.forYou}
            </Text>
          </View>
        </View>
      </Page>

      {/* ── 02 ABERTURA (greeting + edição) ─────────────────────── */}
      <Page size="A4" style={s.pageLight}>
        <GridOverlay />
        <Text style={s.sideTagLight}>{copy.greetingLabel}</Text>
        <Text style={s.pageNumberLight} render={() => copy.pageOf(2, TOTAL_PAGES)} fixed />
        <View style={{ marginTop: 80, direction: dir }}>
          <Text style={[s.eyebrow]}>{archetype} · {archName}</Text>
          <Text style={[s.h1, { marginTop: 18, color: PDF_COLORS.ink }]}>
            {diagnosis.greeting}
          </Text>
          <View style={s.twoCol}>
            <View style={s.col}>
              <Text style={[s.tag, { color: PDF_COLORS.brand, marginBottom: 6 }]}>{copy.invisiblePattern}</Text>
              <Text style={[s.body, { color: PDF_COLORS.ink }]}>
                {diagnosis.invisiblePattern}
              </Text>
            </View>
            <View style={[s.col, { maxWidth: 160 }]}>
              <Text style={s.stamp}>{archetype}</Text>
              <Text style={[s.body, { marginTop: 12, color: PDF_COLORS.mute, fontSize: PDF_TYPE.small }]}>
                {archTag}
              </Text>
            </View>
          </View>
        </View>
      </Page>

      {/* ── 03 ÍNDICE / SCORES das 4 áreas ────────────────────── */}
      <Page size="A4" style={s.pageDark}>
        <GridOverlay />
        <Text style={s.sideTagDark}>INDEX</Text>
        <Text style={s.pageNumberDark} render={() => copy.pageOf(3, TOTAL_PAGES)} fixed />
        <Text style={[s.h2, { color: PDF_COLORS.paper, marginTop: 40 }]}>{copy.intensity}</Text>
        <View style={{ marginTop: 28, direction: dir }}>
          {areaList.map((a, i) => (
            <View key={a.k} style={{ marginBottom: 22 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={[s.h3, { color: PDF_COLORS.paper }]}>{String(i + 1).padStart(2, "0")} · {a.label}</Text>
                <Text style={[s.h3, { color: PDF_COLORS.brand }]}>{a.score}</Text>
              </View>
              <View style={s.scoreBarTrack}>
                <View style={[s.scoreBarFill, { width: `${a.score}%` }]} />
              </View>
              <Text style={[s.body, { color: PDF_COLORS.mute, fontSize: PDF_TYPE.small, marginTop: 6 }]}>
                {diagnosis.areas[a.k].rootBehavior}
              </Text>
            </View>
          ))}
        </View>
      </Page>

      {/* ── 04–11 ÁREAS (2 páginas cada) ────────────────────── */}
      {areaList.map((a, idx) => {
        const data = diagnosis.areas[a.k];
        const coverPage = 4 + idx * 2;
        const dossierPage = coverPage + 1;
        return (
          <React.Fragment key={a.k}>
            {/* Cover da área (dark + wash) */}
            <Page size="A4" style={{ ...s.pageDark, padding: 0 }}>
              <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: pal.primary, opacity: 0.55 }} />
              <Text
                style={{
                  position: "absolute",
                  bottom: -20,
                  left: -20,
                  fontFamily: rtl ? "NotoNaskhArabic" : "Syne",
                  fontWeight: 800,
                  fontSize: 280,
                  color: PDF_COLORS.paper,
                  opacity: 0.08,
                  letterSpacing: -10,
                }}
              >
                {a.label.toUpperCase()}
              </Text>
              <GridOverlay />
              <View style={{ padding: PDF_SPACING.pageMarginX, height: "100%", justifyContent: "space-between" }}>
                <Text style={[s.tag, { color: PDF_COLORS.paper }]}>{copy.area} · {String(idx + 1).padStart(2, "0")} / 04</Text>
                <View>
                  <Text style={[s.eyebrow, { color: pal.accent }]}>{copy.intensity}: {a.score}</Text>
                  <Text style={[s.hero, { color: PDF_COLORS.paper, marginTop: 8 }]}>{a.label}</Text>
                  <View style={{ height: 2, width: 60, backgroundColor: PDF_COLORS.brand, marginVertical: 14 }} />
                  <Text style={[s.body, { color: PDF_COLORS.paper, opacity: 0.85, maxWidth: 340 }]}>{data.rootBehavior}</Text>
                </View>
              </View>
              <Text style={[s.pageNumberDark, { color: PDF_COLORS.paper, opacity: 0.7 }]} render={() => copy.pageOf(coverPage, TOTAL_PAGES)} fixed />
            </Page>

            {/* Dossiê + Plano 7d + Exercício */}
            <Page size="A4" style={s.pageLight}>
              <GridOverlay />
              <Text style={s.sideTagLight}>{copy.dossier} · {a.label.toUpperCase()}</Text>
              <Text style={s.pageNumberLight} render={() => copy.pageOf(dossierPage, TOTAL_PAGES)} fixed />
              <View style={{ direction: dir, marginTop: 50 }}>
                <Text style={[s.eyebrow]}>{copy.area} · {a.label}</Text>
                <Text style={[s.h2, { marginTop: 8, color: PDF_COLORS.ink }]}>{copy.dossier}</Text>
                <View style={s.quoteRule}>
                  <Text style={[s.body, { color: PDF_COLORS.ink }]}>{data.diagnosis}</Text>
                </View>
                <View style={s.twoCol}>
                  <View style={s.col}>
                    <Text style={[s.tag, { color: PDF_COLORS.brand, marginBottom: 8 }]}>{copy.weekPlan}</Text>
                    {data.weekPlan.map((step, i) => (
                      <View key={i} style={{ flexDirection: "row", marginBottom: 6 }}>
                        <Text style={{ width: 28, fontFamily: rtl ? "NotoNaskhArabic" : "Syne", fontWeight: 800, color: PDF_COLORS.brand }}>
                          {String(i + 1).padStart(2, "0")}
                        </Text>
                        <Text style={[s.body, { flex: 1, color: PDF_COLORS.ink }]}>{step}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={[s.col, { backgroundColor: PDF_COLORS.ink, padding: 16, color: PDF_COLORS.paper }]}>
                    <Text style={[s.tag, { color: pal.accent }]}>{copy.exercise}</Text>
                    <Text style={[s.h3, { color: PDF_COLORS.paper, marginTop: 8 }]}>{data.exercise.title}</Text>
                    <View style={{ marginTop: 10 }}>
                      {data.exercise.steps.map((st, i) => (
                        <View key={i} style={{ flexDirection: "row", marginBottom: 6 }}>
                          <Text style={{ width: 18, color: PDF_COLORS.brand, fontWeight: 700 }}>·</Text>
                          <Text style={[s.body, { flex: 1, color: PDF_COLORS.paper, fontSize: PDF_TYPE.small }]}>{st}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            </Page>
          </React.Fragment>
        );
      })}

      {/* ── 12 PROTOCOLO 7 DIAS ───────────────────────────── */}
      <Page size="A4" style={s.pageDark}>
        <GridOverlay />
        <Text style={s.sideTagDark}>PROTOCOL</Text>
        <Text style={s.pageNumberDark} render={() => copy.pageOf(12, TOTAL_PAGES)} fixed />
        <View style={{ direction: dir, marginTop: 40 }}>
          <Text style={[s.eyebrow]}>{copy.protocolTitle}</Text>
          <Text style={[s.h1, { color: PDF_COLORS.paper, marginTop: 6 }]}>7 / 7</Text>
          <Text style={[s.body, { color: PDF_COLORS.mute, marginTop: 6 }]}>{copy.protocolSub}</Text>
          <View style={{ marginTop: 22 }}>
            {diagnosis.protocol7d.map((p) => (
              <View key={p.day} style={s.row}>
                <Text style={s.cellDay}>{copy.day} {String(p.day).padStart(2, "0")}</Text>
                <Text style={[s.cellMain, { color: PDF_COLORS.paper }]}>{p.action}</Text>
                <Text style={s.cellCue}>{p.cue}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>

      {/* ── 13 GATILHOS ───────────────────────────────────── */}
      <Page size="A4" style={s.pageLight}>
        <GridOverlay />
        <Text style={s.sideTagLight}>TRIGGERS</Text>
        <Text style={s.pageNumberLight} render={() => copy.pageOf(13, TOTAL_PAGES)} fixed />
        <View style={{ direction: dir, marginTop: 40 }}>
          <Text style={[s.eyebrow]}>{copy.triggersTitle}</Text>
          <Text style={[s.h1, { color: PDF_COLORS.ink, marginTop: 6 }]}>05</Text>
          <Text style={[s.body, { color: PDF_COLORS.mute, marginTop: 6 }]}>{copy.triggersSub}</Text>
          <View style={{ marginTop: 24 }}>
            {diagnosis.triggers.map((t, i) => (
              <View key={i} style={{ flexDirection: "row", gap: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: PDF_COLORS.mute }}>
                <Text style={{ width: 36, fontFamily: rtl ? "NotoNaskhArabic" : "Syne", fontWeight: 800, color: PDF_COLORS.brand, fontSize: 22 }}>
                  {String(i + 1).padStart(2, "0")}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.tag, { color: PDF_COLORS.brand }]}>{copy.trigger}</Text>
                  <Text style={[s.body, { color: PDF_COLORS.ink, marginTop: 2 }]}>{t.trigger}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.tag, { color: PDF_COLORS.ink }]}>{copy.counter}</Text>
                  <Text style={[s.body, { color: PDF_COLORS.ink, marginTop: 2 }]}>{t.counter}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Page>

      {/* ── 14 CONTRA-CAPA / RITUAL ───────────────────────── */}
      <Page size="A4" style={{ ...s.pageDark, padding: 0 }}>
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: PDF_COLORS.ink }} />
        <Text
          style={{
            position: "absolute",
            top: 60,
            left: -10,
            right: -10,
            fontFamily: rtl ? "NotoNaskhArabic" : "Syne",
            fontWeight: 800,
            fontSize: 220,
            color: pal.primary,
            opacity: 0.18,
            letterSpacing: -8,
            lineHeight: 0.85,
          }}
        >
          MIND{"\n"}RESET
        </Text>
        <GridOverlay />
        <View style={{ padding: PDF_SPACING.pageMarginX, height: "100%", justifyContent: "space-between", direction: dir }}>
          <Text style={[s.tag, { color: PDF_COLORS.brand }]}>{copy.ritualTitle}</Text>
          <View>
            <Text style={[s.h2, { color: PDF_COLORS.paper, maxWidth: 380 }]}>{copy.ritualBody}</Text>
            <View style={{ height: 2, width: 60, backgroundColor: PDF_COLORS.brand, marginVertical: 18 }} />
            <Text style={[s.body, { color: PDF_COLORS.mute, fontSize: PDF_TYPE.small }]}>{copy.signoff}</Text>
          </View>
        </View>
        <Text style={[s.pageNumberDark, { color: PDF_COLORS.paper, opacity: 0.5 }]} render={() => copy.pageOf(14, TOTAL_PAGES)} fixed />
      </Page>
    </Document>
  );
}

// React import required by JSX
import React from "react";