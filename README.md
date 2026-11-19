# ACKaraca

Ahmet Cem Karaca'nın mimarlık, ürün tasarımı ve yazılım işlerini gösterdiği
kişisel site. Türkçe ve İngilizce yayın yapar, sayfalar derleme sırasında statik
HTML olarak üretilir. İçerik Firebase'de tutulur ve `/studio` üzerinden yönetilir.

## Nasıl çalışır

Ziyaretçiler Firestore'a hiç bağlanmaz. Yayındaki içerik (`projects`, `journal`,
`siteSettings`) derleme sırasında Firestore'dan okunur, doğrulanır ve
[`src/data/generated-content.json`](src/data/generated-content.json) dosyasına
yazılır. İstemci, prerender ve sitemap aynı dosyayı kullanır. Taslak ve arşiv
içeriği bu dosyaya girmez; derleme bunu ayrıca kontrol eder.

İçeriği yalnızca site sahibi düzenleyebilir. `/studio` girişi şunların hepsini
ister: doğrulanmış e-posta, TOTP ile ikinci adım, `admin: true` claim'i ve
yapılandırılmış sahip e-postasıyla birebir eşleşme. Başka hesapların oluşturulması
ve giriş yapması Cloud Functions tarafında engellenir.

Studio'da bir kayıt kaydedildiğinde canlı site hemen değişmez. Functions bir
yeniden derleme isteği kuyruğa alır, GitHub Actions siteyi yeniden derleyip
yayınlar. Studio, yayın gerçekten bittiğinde bunu gösterir.

Kullanılanlar: React 19, TypeScript, Vite 8, Framer Motion, Three.js, Zod,
Firebase (Hosting, Firestore, Storage, Auth, Functions, App Check).

## Dizin yapısı

```text
src/
  components/   arayüz bileşenleri; corridor/ ana sayfadaki 3B koridor, studio/ yönetim paneli
  context/      dil, tema, içerik ve oturum durumu
  data/         yedek içerik ve üretilmiş snapshot
  domain/       Zod şemaları ve URL doğrulaması
  lib/firebase/ Firebase istemcisi ve yönetici veri katmanı
  pages/        site sayfaları, pafta görünümü ve Studio
functions/      Cloud Functions ve yönetim scriptleri
scripts/        derleme, prerender ve deploy araçları
tests/rules/    Firestore ve Storage kural testleri (emülatör)
```

## Sayfalar

| Yol | İçerik |
| --- | --- |
| `/` | 3B koridor ana sayfa |
| `/classic` | Klasik ana sayfa |
| `/work`, `/work/:slug` | Projeler ve proje sayfaları |
| `/about`, `/contact` | Hakkımda ve iletişim formu |
| `/journal`, `/lab` (ve `/:slug`) | Yazılar ve deneyler |
| `/privacy`, `/terms` | Site gizlilik ve koşullar; uygulamalar için ayrı sayfalar da var |
| `/pafta/:code` | Eski basılı paftalardaki QR bağlantıları |
| `/studio`, `/studio/setup` | Yönetim paneli ve TOTP kaydı |

İngilizce sürüm `/en` önekiyle açılır.

## Yerel geliştirme

Node.js 22 önerilir (en az 20.19). Rules testleri için Java 21 veya üstü gerekir.

```sh
npm ci
npm ci --prefix functions
cp .env.example .env.local   # Firebase web değerlerini doldurun
npm run dev
```

`.env.local` içindeki Firebase web değerleri gizli değildir, ama doğru projeyi
göstermelidir. Servis hesabı anahtarlarını, Functions secret'larını, App Check
debug token'ını ve yönetici UID/e-postasını commit etmeyin. Emülatörler yalnızca
`VITE_FIREBASE_USE_EMULATORS=true` ile açılır.

## Test ve kontroller

```sh
npm run typecheck
npm run lint
npm test                 # web birim testleri
npm test --prefix functions
npm run test:rules       # Firestore ve Storage kuralları, emülatörle
npm run audit:policy     # bağımlılık güvenlik denetimi
npm run build
```

CI (`quality.yml`) aynı adımları her pull request'te çalıştırır.

`audit:policy`, çalışma zamanı bağımlılıklarında bilinen açık kabul etmez. Tek
istisna, deploy aracı `firebase-tools` içindeki iki orta seviyeli uyarıdır;
istisna [`scripts/dependency-audit-policy.json`](scripts/dependency-audit-policy.json)
dosyasında sahibi ve son inceleme tarihiyle tutulur.

## Firebase kurulumu

İlk kurulum sırası (Identity Platform, tek yönetici hesabı, TOTP, claim) ve tüm
yönetim komutları [`functions/README.md`](functions/README.md) dosyasında.

Güvenlik kuralları ve index tanımları şu dosyalarda yaşar, README'ye kopyalanmaz:

- [`firestore.rules`](firestore.rules)
- [`storage.rules`](storage.rules)
- [`firestore.indexes.json`](firestore.indexes.json)

Ortam değişkenleri için şablonlar: [`.env.example`](.env.example) (web) ve
[`functions/.env.example`](functions/.env.example) (Functions).

## Yayınlama

Canlıya çıkarken `firebase deploy` doğrudan kullanılmaz; `npm run deploy:production`
çalıştırılır. Bu komut içeriği Firestore'dan alıp siteyi derler, medya erişim
listesini önce eski ve yeni dosyaların birleşimine açar, Firebase kaynaklarını
yayınlar ve yalnızca hepsi başarılı olursa listeyi yeni sürüme daraltır. Bir
adım başarısız olursa eski sitenin görselleri erişilebilir kalır.

Normalde bunu elle çalıştırmazsınız. Studio'daki her kayıt
[`production-deploy.yml`](.github/workflows/production-deploy.yml) workflow'unu
`site-rebuild` olayıyla tetikler. İşler tek bir sırada çalışır ve workflow,
uzun ömürlü anahtar yerine GitHub OIDC ile Workload Identity Federation kullanır.

Workflow için gerekenler:

- Production environment secret'ları: `FIREBASE_PROJECT_ID`,
  `ACKARACA_STORAGE_BUCKET`, `ACKARACA_ADMIN_EMAIL`,
  `GCP_WORKLOAD_IDENTITY_PROVIDER`, `GCP_DEPLOY_SERVICE_ACCOUNT`
- Environment variable'ları: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
  `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`,
  `VITE_FIREBASE_APPCHECK_SITE_KEY`, `SITE_REBUILD_PROVIDER`,
  `SITE_REBUILD_WEBHOOK_HOST`
- Deploy hesabına geniş Firebase Admin yetkisi vermeyin. Sahip kontrolü için
  `roles/firebaseauth.viewer` ve `systemPolicies/owner-access` için dar bir
  Firestore okuma izni yeter.

Studio'dan GitHub'a gönderilen rebuild isteği için Functions tarafında
`SITE_REBUILD_PROVIDER=github`, `SITE_REBUILD_WEBHOOK_HOST=api.github.com`, bu
depoya `repository_dispatch` gönderebilen bir `SITE_REBUILD_WEBHOOK_TOKEN` ve
`https://api.github.com/repos/<sahip>/<depo>/dispatches` adresi gerekir.

Workflow elle revizyon numarası kabul etmez. Revizyon ve istek kimliği yalnızca
sunucudaki kuyruktan gelir. Üretim projesi, bucket ve secret'lar bu depoda
olmadığı için yerelde yapılan doğrulama canlı bir deploy yapmaz.

### Eski production'dan geçiş

Eski sürümden ilk kez geçerken adımların sırası güvenlik açısından önemlidir:

1. Bağımlılıkları kurun, `npm run audit:policy` ve
   `node scripts/verify-public-content.mjs` çalıştırın. Identity Platform'u ve
   e-posta/parola girişini açın, sahip hesabını oluşturup e-postasını doğrulayın.
2. Storage Rules'ın Firestore'u okuyabilmesi için Firebase'de
   [cross-service Rules bağlantısını](https://firebase.google.com/docs/rules/manage-deploy#manage_permissions_for_cross-service_cloud_storage_security_rules)
   açın ve Storage service agent'ında `Firebase Rules Firestore Service Agent`
   rolünün bulunduğunu doğrulayın.
3. Eski `adminLoginGuard` ve HTTP `seedContent` fonksiyonlarını
   `npm run legacy:retire --prefix functions` ile kaldırın. `firebase deploy --force`
   kullanmayın.
4. `npm run bootstrap:plan` çıktısındaki dosya sayısını ve SHA-256 değerini
   inceleyin, ardından revizyon `0` ile yedek içeriği deploy edin. Önce statik
   Hosting, sonra kurallar, index'ler, Storage ve Functions yayınlanır.
5. `/studio/setup` üzerinden TOTP kaydedin ve admin claim'ini verin. Çıkış yapıp
   tekrar girin ve `/studio` erişimini doğrulayın.
6. `npm run legacy:migrate-content --prefix functions` ile dry-run alın, üretilen
   planı inceleyin ve onay değerleriyle `--apply` çalıştırın.
7. Migration'ın kuyruğa aldığı ilk gerçek rebuild'in (revizyon > 0) tamamlanmasını
   bekleyin. Yedek içerikle bootstrap'i bir daha çalıştırmayın.

Her adımın komutları, onay ifadeleri ve kurtarma yolları
[`functions/README.md`](functions/README.md) içinde.

## Eski pafta kayıtları

`paftas` koleksiyonunda `status: "active"` olan eski kayıtlar herkese açık
değildir. Otomatik taşıma yapılmaz. Her kaydı içerik ve medya açısından elle
inceleyin, yayınlanacakları `status: "published"` yapın, sonra index'i ve
Functions'ı deploy edin.

## Lisans

Bu depo kişisel portfolyo içeriğini ve site kaynak kodunu içerir. Yeniden
kullanmadan önce depo sahibinden izin alın.
