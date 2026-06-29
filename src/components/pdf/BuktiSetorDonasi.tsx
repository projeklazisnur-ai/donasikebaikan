import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

export interface BuktiSetorDonasiProps {
  donorName: string;
  donorPhone: string;
  amount: number;
  campaignTitle: string;
  transactionId: string;
  date: string;
  receiptNo: string;
  donorIdShort: string;
  bankInfo: string;
  jenis: string;
  tb: string;
  logo: string;
}

const G = "#2d7d32";
const D = "#111111";
const GR = "#666666";
const BD = "#cccccc";
const R = "#c62828";

const s = StyleSheet.create({
  page: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontFamily: "Helvetica",
    fontSize: 8,
  },

  // ── HEADER ──
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: G,
    paddingBottom: 6,
    marginBottom: 8,
  },
  logo: { width: 90, height: 34, objectFit: "contain", marginRight: 10 },
  orgBlock: { flex: 1 },
  orgTagline: { fontSize: 6.5, color: GR, fontStyle: "italic", marginTop: 1 },
  orgAddress: { fontSize: 6, color: GR, marginTop: 2, lineHeight: 1.4 },
  headerRight: { width: 180 },
  licBold: { fontSize: 6.5, fontFamily: "Helvetica-Bold", color: D, marginBottom: 1 },
  licLine: { fontSize: 6.5, color: D, marginBottom: 1 },

  // ── BODY ──
  body: { flexDirection: "row", flex: 1 },
  leftCol: { width: "42%", paddingRight: 12, borderRightWidth: 0.5, borderRightColor: BD },
  rightCol: { flex: 1, paddingLeft: 12 },

  titleLeft: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textDecoration: "underline",
    textAlign: "center",
    color: D,
    marginBottom: 8,
  },

  // ── FIELD ROWS ──
  fr: { flexDirection: "row", marginBottom: 4, alignItems: "flex-start" },
  fl: { width: 76, fontSize: 7.5, color: D },
  fc: { width: 8, fontSize: 7.5, color: D },
  fv: { flex: 1, fontSize: 7.5, color: D },
  fvb: { flex: 1, fontSize: 7.5, fontFamily: "Helvetica-Bold", color: D },

  // ── JENIS DANA ──
  jenisRow: { flexDirection: "row", marginBottom: 3, alignItems: "center" },
  chk: {
    width: 9,
    height: 9,
    borderWidth: 0.75,
    borderColor: D,
    marginRight: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  chkMark: { fontSize: 7, color: D },
  jLabel: { fontSize: 7.5, color: D, marginRight: 8 },
  bankBox: {
    borderWidth: 0.5,
    borderColor: D,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    marginLeft: 2,
  },
  bankTxt: { fontSize: 7, color: D },

  // ── SIGNATURES ──
  sigArea: { flexDirection: "row", marginTop: 14 },
  sigBox: { flex: 1, alignItems: "center" },
  sigLabel: { fontSize: 6.5, color: D, textAlign: "center", marginBottom: 24 },
  sigLogo: { width: 55, height: 20, objectFit: "contain", marginBottom: 2 },
  sigName: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: D,
    textAlign: "center",
    borderTopWidth: 0.5,
    borderTopColor: D,
    paddingTop: 2,
    width: "85%",
  },

  // ── TABLE ──
  table: { borderWidth: 0.5, borderColor: BD, marginBottom: 4 },
  tHead: {
    flexDirection: "row",
    backgroundColor: "#eeeeee",
    borderBottomWidth: 0.5,
    borderBottomColor: BD,
  },
  tRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: BD },
  tRowLast: { flexDirection: "row" },
  cNoH: {
    width: 18, paddingVertical: 3, paddingHorizontal: 2,
    borderRightWidth: 0.5, borderRightColor: BD,
    fontSize: 7, textAlign: "center", fontFamily: "Helvetica-Bold",
  },
  cJenisH: {
    width: 120, paddingVertical: 3, paddingHorizontal: 3,
    borderRightWidth: 0.5, borderRightColor: BD,
    fontSize: 7, fontFamily: "Helvetica-Bold",
  },
  cKetH: {
    flex: 1, paddingVertical: 3, paddingHorizontal: 3,
    borderRightWidth: 0.5, borderRightColor: BD,
    fontSize: 7, fontFamily: "Helvetica-Bold",
  },
  cJmlH: {
    width: 85, paddingVertical: 3, paddingHorizontal: 4,
    fontSize: 7, fontFamily: "Helvetica-Bold", textAlign: "right",
  },
  cNo: {
    width: 18, paddingVertical: 3, paddingHorizontal: 2,
    borderRightWidth: 0.5, borderRightColor: BD,
    fontSize: 7, textAlign: "center",
  },
  cJenis: {
    width: 120, paddingVertical: 3, paddingHorizontal: 3,
    borderRightWidth: 0.5, borderRightColor: BD, fontSize: 7,
  },
  cKet: {
    flex: 1, paddingVertical: 3, paddingHorizontal: 3,
    borderRightWidth: 0.5, borderRightColor: BD, fontSize: 7,
  },
  cJml: { width: 85, paddingVertical: 3, paddingHorizontal: 4, fontSize: 7, textAlign: "right" },

  // ── TOTAL ──
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: D,
    paddingTop: 3,
    marginBottom: 5,
  },
  totalLbl: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: D, paddingRight: 8 },
  totalBox: {
    width: 85,
    borderWidth: 0.5,
    borderColor: D,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  totalVal: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: D, textAlign: "right" },

  // ── TERBILANG ──
  tbLbl: { fontSize: 7, color: D, marginBottom: 1 },
  tbBox: { borderWidth: 0.5, borderColor: BD, padding: 4, marginBottom: 3 },
  tbTxt: { fontSize: 8, fontStyle: "italic", color: D },
  noteSmall: { fontSize: 6.5, color: GR, fontStyle: "italic", marginBottom: 5 },

  // ── DOA ──
  doaBox: { borderWidth: 0.5, borderColor: BD, padding: 6 },
  doaArabic: { fontSize: 7.5, textAlign: "center", fontStyle: "italic", color: D, marginBottom: 3 },
  doaTrans: { fontSize: 6.5, color: GR, textAlign: "center" },

  // ── FOOTER ──
  footerRed: { fontSize: 6.5, color: R, fontStyle: "italic", marginTop: 6 },
});

const EMPTY_ROWS = 6;

export default function BuktiSetorDonasi(p: BuktiSetorDonasiProps) {
  return (
    <Document title={`Bukti Setor Donasi - ${p.donorName}`} author="LAZISNUR">
      <Page size="A4" orientation="landscape" style={s.page}>

        {/* HEADER */}
        <View style={s.header}>
          {p.logo
            ? <Image src={p.logo} style={s.logo} />
            : <Text style={{ fontSize: 18, fontFamily: "Helvetica-Bold", color: G, marginRight: 10, width: 90 }}>LAZISNUR</Text>
          }
          <View style={s.orgBlock}>
            <Text style={s.orgTagline}>Mencerdaskan memberdayakan</Text>
            <Text style={s.orgAddress}>
              Komplek Ruko Sabar Ganda Blok C No.6{"\n"}
              Jl. KSR Dadi Kusmayadi Kel. Tengah Kec. Cibinong Bogor
            </Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.licBold}>Izin Operasional :</Text>
            <Text style={s.licLine}>Nomor 910 Tahun 2023 Tanggal 16 Oktober 2023</Text>
            <Text style={s.licLine}>Kementerian Agama Prov. Jawa Barat</Text>
            <Text style={s.licLine}>Dirjen Pajak : Nomor Per-4/PJ/2026</Text>
            <Text style={s.licLine}>Terakreditasi A</Text>
            <Text style={s.licLine}>Member of FOZ Nomor Anggota : 119.FOZ.2019</Text>
          </View>
        </View>

        {/* BODY: two columns */}
        <View style={s.body}>

          {/* ── LEFT COLUMN ── */}
          <View style={s.leftCol}>
            <Text style={s.titleLeft}>BUKTI SETOR DONASI</Text>

            {/* Field rows */}
            {(
              [
                ["No. Kwitansi", p.receiptNo, false],
                ["ID Donatur", p.donorIdShort, false],
                ["Fundraiser", "-", false],
                ["Nama Muzakki", p.donorName, true],
                ["Alamat", "-", false],
              ] as [string, string, boolean][]
            ).map(([lbl, val, bold]) => (
              <View key={lbl} style={s.fr}>
                <Text style={s.fl}>{lbl}</Text>
                <Text style={s.fc}>:</Text>
                <Text style={bold ? s.fvb : s.fv}>{val}</Text>
              </View>
            ))}

            <View style={{ height: 4 }} />

            {(
              [
                ["Telp/Hp", p.donorPhone || "-", false],
                ["NPWP", "-", false],
              ] as [string, string, boolean][]
            ).map(([lbl, val, bold]) => (
              <View key={lbl} style={s.fr}>
                <Text style={s.fl}>{lbl}</Text>
                <Text style={s.fc}>:</Text>
                <Text style={bold ? s.fvb : s.fv}>{val}</Text>
              </View>
            ))}

            {/* Jenis Dana */}
            <View style={s.fr}>
              <Text style={s.fl}>Jenis Dana</Text>
              <Text style={s.fc}>:</Text>
              <View style={{ flex: 1 }}>
                <View style={s.jenisRow}>
                  <View style={s.chk}><Text style={s.chkMark}> </Text></View>
                  <Text style={s.jLabel}>Tunai</Text>
                </View>
                <View style={s.jenisRow}>
                  <View style={s.chk}><Text style={s.chkMark}>x</Text></View>
                  <Text style={s.jLabel}>Bank</Text>
                  {p.bankInfo ? (
                    <View style={s.bankBox}>
                      <Text style={s.bankTxt}>{p.bankInfo}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            {/* Tanggal */}
            <View style={s.fr}>
              <Text style={s.fl}>Tanggal</Text>
              <Text style={s.fc}>:</Text>
              <Text style={s.fv}>{p.date}</Text>
            </View>

            {/* Signatures */}
            <View style={s.sigArea}>
              <View style={s.sigBox}>
                <Text style={s.sigLabel}>Penyetor/Wajib Zakat (Muzakki)</Text>
                <Text style={s.sigName}>{p.donorName}</Text>
              </View>
              <View style={s.sigBox}>
                <Text style={s.sigLabel}>Diterima Oleh Petugas</Text>
                {p.logo ? <Image src={p.logo} style={s.sigLogo} /> : null}
                <Text style={s.sigName}>LAZISNUR</Text>
              </View>
            </View>
          </View>

          {/* ── RIGHT COLUMN ── */}
          <View style={s.rightCol}>
            {/* Table */}
            <View style={s.table}>
              <View style={s.tHead}>
                <Text style={s.cNoH}>No.</Text>
                <Text style={s.cJenisH}>JENIS DONASI</Text>
                <Text style={s.cKetH}>KETERANGAN</Text>
                <Text style={s.cJmlH}>JUMLAH</Text>
              </View>

              {/* First data row — filled */}
              <View style={s.tRow}>
                <Text style={s.cNo}>1</Text>
                <Text style={s.cJenis}>{p.jenis}</Text>
                <Text style={s.cKet}>{p.campaignTitle}</Text>
                <Text style={s.cJml}>{fmtRupiah(p.amount)}</Text>
              </View>

              {/* Empty rows */}
              {Array.from({ length: EMPTY_ROWS }).map((_, i) => (
                <View key={i} style={i === EMPTY_ROWS - 1 ? s.tRowLast : s.tRow}>
                  <Text style={s.cNo}>{i + 2}</Text>
                  <Text style={s.cJenis}>-</Text>
                  <Text style={s.cKet}>-</Text>
                  <Text style={s.cJml}>-</Text>
                </View>
              ))}
            </View>

            {/* Total */}
            <View style={s.totalRow}>
              <Text style={s.totalLbl}>Total</Text>
              <View style={s.totalBox}>
                <Text style={s.totalVal}>{fmtRupiah(p.amount)}</Text>
              </View>
            </View>

            {/* Terbilang */}
            <Text style={s.tbLbl}>Terbilang:</Text>
            <View style={s.tbBox}>
              <Text style={s.tbTxt}>{p.tb}</Text>
            </View>
            <Text style={s.noteSmall}>*Setiap Infaq Program sudah termasuk operasional lembaga 20%</Text>

            {/* Doa */}
            <View style={s.doaBox}>
              <Text style={s.doaArabic}>
                Ajarakallahu fiimaa a{"'"}thayta, wa baaraka fiimaa abqayta wa ja{"'"}alahu laka thohuuron
              </Text>
              <Text style={s.doaTrans}>
                Semoga Allah memberikan pahala kepadamu pada barang yang engkau berikan (zakatkan) dan semoga Allah{"\n"}
                memberkahimu dalam harta-harta yang masih engkau sisakan dan semoga pula menjadikannya sebagai pembersih (dosa) bagimu
              </Text>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <Text style={s.footerRed}>
          *) Bahwa sumber dana donasi berasal dari sumber dana halal, tidak bertentangan dengan peraturan yang berlaku dan bukan merupakan pencucian uang
        </Text>
      </Page>
    </Document>
  );
}

function fmtRupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
