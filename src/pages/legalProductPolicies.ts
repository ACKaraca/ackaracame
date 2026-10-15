import type { LegalPolicy } from './LegalPage';

const l = (tr: string, en: string) => ({ tr, en });
const updated = l('Son güncelleme: 15 Ekim 2026', 'Last updated: 15 October 2026');

const rightsParagraph = l(
  'KVKK (6698 sayılı Kanun), GDPR/UK GDPR ve uygulanabilir diğer mevzuat kapsamında verilerinize erişme, düzeltme, silme, işlemeyi kısıtlama, itiraz etme ve taşınabilirlik haklarına sahip olabilirsiniz. Talepler için aşağıdaki iletişim adresini kullanabilirsiniz; hesap sahipliğini doğrulamamız gerekebilir. Yetkili veri koruma otoritesine (Türkiye’de KVKK Kurulu) şikâyet hakkınız saklıdır.',
  'Under KVKK (Turkish Law No. 6698), GDPR/UK GDPR, and other applicable law, you may have the right to access, correct, delete, restrict, object to, and port your data. Use the contact address below for requests; we may need to verify account ownership. Your right to complain to a competent data-protection authority (in Türkiye, the KVKK Board) is reserved.',
);

const changesParagraph = l(
  'Bu metni zaman zaman güncelleyebiliriz. Güncel sürüm bu adreste yayımlanır; önemli değişiklikler uygulama içinde veya mağaza sayfasında duyurulur. Değişiklikten sonra hizmeti kullanmaya devam etmeniz güncel metni kabul ettiğiniz anlamına gelir.',
  'We may update this text from time to time. The current version is published at this address; material changes are announced in the app or on the store listing. Continuing to use the service after a change means you accept the current text.',
);

export const productPolicies: Record<
  'hypcas-privacy' | 'hypcas-terms' | 'dua-privacy' | 'dua-terms' | 'drawordie-privacy' | 'drawordie-terms',
  LegalPolicy
> = {
  'hypcas-privacy': {
    eyebrow: l('HypCas / yasal', 'HypCas / legal'),
    title: l('HypCas gizlilik politikası', 'HypCas privacy policy'),
    intro: l(
      'HypCas, ACKARACA tarafından yayımlanan bir mini oyun koleksiyonudur. Bu politika uygulamanın hangi verileri işlediğini ve işlemediğini açıklar.',
      'HypCas is a collection of casual mini-games published by ACKARACA. This policy explains what data the app does and does not process.',
    ),
    date: updated,
    sections: [
      {
        heading: l('Özet', 'Summary'),
        paragraphs: [l('HypCas’ın ilk Google Play sürümü reklamsızdır: reklam SDK’sı, analiz SDK’sı veya satın alma SDK’sı çalışmaz ve reklam kimliği (AAID) kullanılmaz. Hesap veya kayıt yoktur; ad, e-posta, telefon, rehber, fotoğraf veya konum istemeyiz. Oyun ilerlemeniz cihazınızda tutulur ve kişisel verileriniz satılmaz.', 'The first Google Play release of HypCas is ad-free: no advertising SDK, analytics SDK, or purchase SDK runs, and the advertising ID (AAID) is not used. There is no account or sign-up; we do not ask for your name, email, phone number, contacts, photos, or location. Your game progress stays on your device and your personal data is not sold.')],
      },
      {
        heading: l('Cihazınızda saklanan veriler', 'Data stored on your device'),
        paragraphs: [l('Aşağıdaki veriler yalnızca uygulamanın yerel depolama alanında tutulur, sunucularımıza gönderilmez ve uygulama verisini temizlediğinizde ya da uygulamayı kaldırdığınızda silinir.', 'The following is kept only in the app’s local storage, is not sent to our servers, and is deleted when you clear the app data or uninstall the app.')],
        items: [
          l('HypCoin bakiyesi (yeni kurulumlarda 50 ile başlar), açılan içerikler, başarımlar ve yüksek skorlar.', 'HypCoin balance (new installs start at 50), unlocked items, achievements, and high scores.'),
          l('Ses, titreşim, grafik kalitesi ve dil gibi ayarlar.', 'Settings such as sound, haptics, graphics quality, and language.'),
        ],
      },
      {
        heading: l('Reklamlar, analiz ve satın almalar', 'Ads, analytics, and purchases'),
        paragraphs: [l('Mevcut sürümde reklam gösterilmez, kullanım analizi toplanmaz ve gerçek parayla satın alma sunulmaz. Uygulama Android manifestinde reklam kimliği izinlerini (AD_ID ve ilgili Ads izinleri) kaldırır ve Google Mobile Ads SDK’sının otomatik başlamasını engeller.', 'The current release shows no ads, collects no usage analytics, and offers no real-money purchases. The app removes the advertising-ID permissions (AD_ID and related Ads permissions) from its Android manifest and prevents the Google Mobile Ads SDK from starting automatically.')],
      },
      {
        heading: l('Gelecek sürümlerde olası değişiklikler', 'Possible changes in future versions'),
        paragraphs: [l('Kod tabanı, ileride etkinleştirilebilecek Google AdMob (reklamlar; EEA/UK için Google UMP onay akışıyla), Firebase Analytics (kullanım istatistikleri) ve RevenueCat + Google Play Faturalandırma (satın almalar) entegrasyonlarını içerir. Bunlardan biri etkinleştirilmeden önce bu politika güncellenir, gerekli izinler ve onay akışları eklenir ve değişiklik uygulama içinde veya mağaza sayfasında duyurulur. Bu hizmetler etkinleştiğinde reklam kimliği, cihaz modeli, işletim sistemi, IP adresinden türetilen yaklaşık konum ve uygulama içi etkileşimler gibi sınırlı veriyi kendi gizlilik politikalarına göre alabilir.', 'The codebase includes integrations that may be enabled later: Google AdMob (ads; with the Google UMP consent flow for the EEA/UK), Firebase Analytics (usage statistics), and RevenueCat + Google Play Billing (purchases). Before any of them is enabled, this policy will be updated, the necessary permissions and consent flows added, and the change announced in the app or on the store listing. When enabled, these services may receive limited data such as the advertising ID, device model, OS, approximate location derived from IP, and in-app interactions under their own privacy policies.')],
      },
      {
        heading: l('Android izinleri', 'Android permissions'),
        paragraphs: [l('Uygulama yalnızca INTERNET iznini bildirir. Kamera, mikrofon, rehber, dosya veya konuma erişmez. Geri bildirim için Google Form bağlantısı ve Google Play uygulama içi değerlendirme penceresi kullanılabilir; bunlar Google’ın kendi gizlilik politikalarına tabidir.', 'The app declares only the INTERNET permission. It does not access your camera, microphone, contacts, files, or location. A Google Form link and the Google Play in-app review prompt may be used for feedback; these are subject to Google’s own privacy policies.')],
      },
      {
        heading: l('Haklarınız ve saklama', 'Your rights and retention'),
        paragraphs: [l('Veriler yalnızca cihazınızda tutulduğundan, uygulama verisini silerek veya uygulamayı kaldırarak tümünü silebilirsiniz. Geri bildirim formunda paylaştığınız bilgiler Google Form üzerinden bize ulaşır ve yalnızca geri bildirimi yanıtlamak için kullanılır.', 'Because data is kept only on your device, you can delete all of it by clearing app data or uninstalling the app. Information you share in the feedback form reaches us through Google Forms and is used only to respond to your feedback.'), rightsParagraph],
      },
      {
        heading: l('Çocuklar', 'Children'),
        paragraphs: [l('HypCas 13 yaş ve üzeri genel kitleye yöneliktir; 13 yaşın altındaki çocuklara yönelik değildir ve onlardan bilerek kişisel veri toplamayız. Bir çocuğun veri sağladığını düşünüyorsanız bize yazın, verileri sileriz.', 'HypCas is intended for a general audience aged 13 and over. It is not directed at children under 13 and we do not knowingly collect their personal data. If you believe a child has provided data, contact us and we will delete it.')],
      },
      {
        heading: l('Değişiklikler', 'Changes'),
        paragraphs: [changesParagraph],
      },
    ],
  },
  'hypcas-terms': {
    eyebrow: l('HypCas / yasal', 'HypCas / legal'),
    title: l('HypCas kullanım koşulları', 'HypCas terms of use'),
    intro: l(
      'Bu koşullar HypCas mini oyun koleksiyonunu ve HypCoin’i kullanırken geçerli kuralları açıklar.',
      'These terms set out the rules that apply when using the HypCas mini-game collection and HypCoin.',
    ),
    date: updated,
    sections: [
      {
        heading: l('Kabul ve uygunluk', 'Acceptance and eligibility'),
        paragraphs: [l('Uygulamayı yüklediğinizde veya kullandığınızda bu koşulları kabul etmiş olursunuz. HypCas 13 yaş ve üzeri kullanıcılar içindir.', 'By installing or using the app you accept these terms. HypCas is for users aged 13 and over.')],
      },
      {
        heading: l('Lisans', 'Licence'),
        paragraphs: [l('Size kişisel, devredilemez, münhasır olmayan ve kişisel eğlence amaçlı bir kullanım lisansı verilir. Uygulamayı kopyalayamaz, tersine mühendislik yapamaz, hile veya otomasyon araçlarıyla bozamaz, yeniden dağıtamaz ya da ticari amaçla kullanamazsınız. Uygulamanın tüm içeriği ve fikri mülkiyeti ACKARACA veya lisans verenlerine aittir; açık kaynak bileşenler kendi lisanslarına tabidir.', 'You receive a personal, non-transferable, non-exclusive licence to use the app for personal entertainment. You may not copy, reverse engineer, tamper with (including through cheats or automation), redistribute, or commercially exploit it. All content and intellectual property in the app belongs to ACKARACA or its licensors; open-source components are subject to their own licences.')],
      },
      {
        heading: l('HypCoin ve sanal öğeler', 'HypCoin and virtual items'),
        paragraphs: [l('HypCoin, oyun içi kazanılan ve harcanan nakit değeri olmayan sanal bir birimdir; paraya çevrilemez ve devredilemez. Açılan içerikler ve skorlar da sanal öğelerdir. İlerlemeniz cihazınızda saklandığından uygulama verisini silmek, cihaz değiştirmek veya uygulamayı kaldırmak ilerlemenin kaybına yol açabilir.', 'HypCoin is a virtual unit earned and spent in-game, with no cash value; it cannot be exchanged for money or transferred. Unlocked items and scores are also virtual items. Because progress is stored on your device, clearing app data, changing devices, or uninstalling may lose it.')],
      },
      {
        heading: l('Reklamlar ve satın almalar', 'Ads and purchases'),
        paragraphs: [l('Mevcut sürüm reklamsızdır ve gerçek parayla satın alma sunmaz. İleride reklam veya satın alma eklenirse fiyat, süre ve koşullar satın alma ekranında gösterilir, ödemeler Google Play üzerinden yapılır ve yasal cayma ve iade haklarınız saklıdır; bu durumda bu koşullar ve gizlilik politikası önceden güncellenir.', 'The current release is ad-free and offers no real-money purchases. If ads or purchases are added later, price, period, and conditions will be shown at purchase, payments will go through Google Play, and your statutory withdrawal and refund rights are unaffected; in that case these terms and the privacy policy will be updated beforehand.')],
      },
      {
        heading: l('Kullanılabilirlik ve sorumluluk', 'Availability and liability'),
        paragraphs: [l('Uygulama “olduğu gibi” sunulur; kesintisiz veya hatasız çalışacağı garanti edilmez. Kanunun izin verdiği ölçüde dolaylı kayıplardan sorumluluk kabul edilmez; kanunen sınırlandırılamayan sorumluluklar saklıdır. Güvenlik, kötüye kullanım veya yasal nedenlerle erişimi sınırlayabilir ya da hizmeti değiştirebiliriz.', 'The app is provided “as is” without a guarantee of uninterrupted or error-free operation. To the extent permitted by law, liability for indirect loss is excluded; liability that cannot legally be limited is unaffected. We may restrict access or change the service for security, abuse, or legal reasons.')],
      },
      {
        heading: l('Gizlilik, uygulanacak hukuk ve iletişim', 'Privacy, governing law, and contact'),
        paragraphs: [l('Verilerin işlenmesi HypCas gizlilik politikasında açıklanır. Bu koşullara Türkiye Cumhuriyeti hukuku uygulanır; tüketici mevzuatının zorunlu hükümleri saklıdır. Sorularınız için aşağıdaki adresi kullanabilirsiniz.', 'Data processing is described in the HypCas privacy policy. These terms are governed by the law of the Republic of Türkiye, without prejudice to mandatory consumer-protection rules. Use the address below for questions.')],
      },
      {
        heading: l('Değişiklikler', 'Changes'),
        paragraphs: [changesParagraph],
      },
    ],
  },
  'dua-privacy': {
    eyebrow: l('DuaAPP / yasal', 'DuaAPP / legal'),
    title: l('DuaAPP gizlilik politikası', 'DuaAPP privacy policy'),
    intro: l(
      'DuaAPP; dua, tesbih, rüya günlüğü, kutsal kitaplar, dini takvim, yapay zekâ sohbeti ve topluluk özellikleri sunan manevi destek uygulamasıdır. Bu politika verilerinizin nasıl işlendiğini açıklar.',
      'DuaAPP is a spiritual-support app with prayers, a counter, a dream journal, holy books, a religious calendar, AI chat, and community features. This policy explains how your data is processed.',
    ),
    date: updated,
    sections: [
      {
        heading: l('Hassas veri uyarısı', 'Sensitive-data notice'),
        paragraphs: [l('Dua, inanç veya manevi tercihleriniz dini inanca ilişkin bilgi içerebilir ve bu, KVKK ile GDPR kapsamında özel nitelikli/özel kategori veridir. Bu tür veriyi yalnızca açık rızanıza dayanarak, siz uygulamada ilgili özelliği kullandığınızda işleriz. Rızanızı dilediğiniz zaman hesap ayarlarından veya hesabı silerek geri çekebilirsiniz.', 'Your prayers, beliefs, or spiritual preferences may reveal religious belief, which is special-category data under KVKK and GDPR. We process it only on the basis of your explicit consent, when you use the relevant feature. You can withdraw consent at any time in account settings or by deleting your account.')],
      },
      {
        heading: l('İşlenen veriler', 'Data we process'),
        paragraphs: [l('Uygulama yalnızca kullandığınız özellikler için gerekli veriyi işler:', 'The app processes only the data needed for the features you use:')],
        items: [
          l('Hesap: kullanıcı kimliği, e-posta, görünen ad, profil fotoğrafı (isteğe bağlı) ve Google ile giriş yaptıysanız Google hesabınızın temel profil bilgileri.', 'Account: user ID, email, display name, optional profile photo, and basic Google profile data if you sign in with Google.'),
          l('İçerik: rüya günlüğü kayıtları, favoriler, tesbih/sayaç geçmişi, kaydedilen dualar, topluluk gönderileri ve yorumları, gizlilik ayarlarınız.', 'Content: dream-journal entries, favourites, counter history, saved prayers, community posts and comments, and your privacy settings.'),
          l('Yapay zekâ: sohbet mesajlarınız ve dua üretimi için girdiğiniz metinler.', 'AI: your chat messages and the text you enter for prayer generation.'),
          l('Konum (isteğe bağlı): namaz vakitleri, kıble ve dini takvim için yaklaşık veya hassas konum; yalnızca siz izin verdiğinizde ve özellik kullanıldığında.', 'Location (optional): approximate or precise location for prayer times, qibla, and the religious calendar; only when you grant permission and use the feature.'),
          l('Kamera/galeri (isteğe bağlı): profil fotoğrafı veya içerik eklemek için seçtiğiniz görseller.', 'Camera/gallery (optional): images you choose for a profile photo or to add to content.'),
          l('Bildirimler: cihaz bildirim belirteci (FCM) ve planladığınız hatırlatıcılar.', 'Notifications: device push token (FCM) and the reminders you schedule.'),
          l('Teknik veri: cihaz modeli, işletim sistemi, uygulama sürümü, hata ve kötüye kullanım önleme kayıtları, kullanım olayları.', 'Technical data: device model, OS, app version, error and abuse-prevention logs, and usage events.'),
          l('Satın alma: abonelik durumu ve işlem kimliği; ödeme bilgilerinizi Google Play işler.', 'Purchases: subscription status and transaction ID; Google Play handles your payment details.'),
          l('Reklamlar: Uygulamada Google AdMob (Google Mobile Ads SDK) entegredir ve uygulama açılırken başlatılır; kodda banner, yerel (native) ve geçiş (interstitial) reklam biçimleri bulunur (topluluk gönderileri görüntülenirken her 7 gönderide bir geçiş reklamı planlıdır). Şu anki sürümde yalnızca Google’ın test reklam birimleri yapılandırılmıştır ve gerçek reklam yayını etkin değildir; üretim reklam birimleri yapılandırıldığında ücretsiz kullanıcılara reklam gösterilir. Reklam SDK’sı reklam kimliği, IP adresi, cihaz modeli ve işletim sistemi, reklam etkileşimleri ve tanılama verilerini Google’a iletebilir. Cihaz ayarlarından reklam kimliğinizi silebilir veya reklam kişiselleştirmeyi kapatabilirsiniz. Dini inanç, dua içeriği veya rüya günlüğü verileriniz reklam hedeflemesi için kullanılmaz.', 'Ads: Google AdMob (Google Mobile Ads SDK) is integrated and initialised when the app starts; the code includes banner, native, and interstitial formats (an interstitial is planned once every 7 community posts viewed). The current build is configured only with Google’s test ad units and live ad serving is not enabled; once production ad units are configured, free users will see ads. The ad SDK may send the advertising ID, IP address, device model and OS, ad interactions, and diagnostics to Google. You can delete your advertising ID or turn off ad personalisation in your device settings. Your religious belief, prayer content, and dream-journal data are not used for ad targeting.'),
        ],
      },
      {
        heading: l('Kullanım amaçları ve hukuki dayanak', 'Purposes and legal bases'),
        paragraphs: [l('Verileri hesabınızı yönetmek, içerik ve hatırlatıcıları sunmak, yapay zekâ yanıtları üretmek, topluluğu güvenli tutmak (kötüye kullanım ve zararlı içerik denetimi dahil), aboneliği doğrulamak, hataları gidermek ve hizmeti geliştirmek için işleriz. Dayanaklar: sözleşmenin ifası, açık rıza (özel nitelikli veri, konum, bildirim), meşru menfaat (güvenlik, kötüye kullanım önleme) ve hukuki yükümlülüklerdir. Hassas verileriniz reklam profili oluşturmak için kullanılmaz ve satılmaz.', 'We use data to manage your account, deliver content and reminders, generate AI responses, keep the community safe (including abuse and harmful-content moderation), verify subscriptions, fix errors, and improve the service. Bases: contract performance, explicit consent (special-category data, location, notifications), legitimate interests (security, abuse prevention), and legal obligations. Your sensitive data is not used to build advertising profiles and is not sold.')],
      },
      {
        heading: l('Hizmet sağlayıcılar ve aktarım', 'Service providers and transfers'),
        paragraphs: [l('Veriler; kimlik doğrulama, veritabanı, depolama ve sunucu fonksiyonları için Supabase’de, yapay zekâ istekleri için Vercel AI Gateway üzerinden bağlı model sağlayıcılarında, bildirimler için Firebase Cloud Messaging’de, reklamlar için reklam SDK’sı olarak Google AdMob’da ve satın almalar için Google Play’de işlenebilir. Bu sağlayıcılar verileri bizim adımıza veya kendi sorumluluklarıyla işler ve verileriniz Türkiye dışındaki ülkelere aktarılabilir; aktarımlar uygulanabilir mevzuattaki güvencelere (standart sözleşme maddeleri, açık rıza vb.) dayanır. Yapay zekâ sohbetlerine kişisel, sağlık veya finansal bilgi yazmamanızı öneririz.', 'Data may be processed by Supabase (authentication, database, storage, server functions), by model providers reached through Vercel AI Gateway (AI requests), Firebase Cloud Messaging (notifications), Google AdMob (ad SDK), and Google Play (purchases). These providers process data on our behalf or under their own responsibility, and data may be transferred outside Türkiye on the basis of safeguards available under applicable law (standard contractual clauses, explicit consent, etc.). We recommend not entering personal, health, or financial information into AI chats.')],
      },
      {
        heading: l('Topluluk görünürlüğü', 'Community visibility'),
        paragraphs: [l('Topluluğa yazdığınız gönderi ve yorumlar, gizlilik ayarlarınıza göre diğer kullanıcılara görünebilir. Rüya günlüğünüz ve kişisel kayıtlarınız varsayılan olarak yalnızca size görünür. Paylaşmadan önce içeriğinizi gözden geçirin.', 'Posts and comments you write in the community may be visible to other users depending on your privacy settings. Your dream journal and personal records are visible only to you by default. Review content before sharing it.')],
      },
      {
        heading: l('Saklama ve silme', 'Retention and deletion'),
        paragraphs: [l('Hesap verileriniz hesabınız açık olduğu sürece saklanır. Uygulamada “Ayarlar → Hesap → Hesabı sil” ile ya da hesap silme sayfasındaki yolla hesabınızı ve ilişkili içeriği silme talebinde bulunabilirsiniz; silme sonrası veriler makul bir süre içinde silinir veya geri döndürülemez biçimde anonimleştirilir. Yasal yükümlülük, dolandırıcılık önleme veya uyuşmazlık çözümü için gerekli sınırlı kayıtlar gerekli süre boyunca tutulabilir; yedeklerden silme ek süre alabilir.', 'Account data is kept while your account is open. Use “Settings → Account → Delete account” in the app, or the process on the account-deletion page, to request deletion of your account and associated content; after deletion, data is deleted or irreversibly anonymised within a reasonable period. Limited records needed for legal obligations, fraud prevention, or dispute resolution may be retained as long as necessary; deletion from backups may take additional time.')],
      },
      {
        heading: l('Haklarınız', 'Your rights'),
        paragraphs: [rightsParagraph],
      },
      {
        heading: l('Çocuklar', 'Children'),
        paragraphs: [l('DuaAPP 13 yaşın altındaki çocuklara yönelik değildir ve onlardan bilerek kişisel veri toplamayız. Ülkenizdeki dijital rıza yaşı daha yüksekse ebeveyn veya vasi izni gerekir. Bir çocuğa ait veri fark ederseniz bize bildirin.', 'DuaAPP is not directed at children under 13 and we do not knowingly collect their personal data. Where your country’s digital age of consent is higher, parental or guardian consent is required. Tell us if you notice a child’s data.')],
      },
      {
        heading: l('Güvenlik ve değişiklikler', 'Security and changes'),
        paragraphs: [l('Veriler aktarım sırasında şifrelenir, erişim rol tabanlı yetkilendirmeyle sınırlandırılır ve hassas anahtarlar cihazda güvenli depolamada tutulur. Hiçbir sistem tamamen risksiz değildir; bir ihlal durumunda mevzuatın gerektirdiği bildirimler yapılır.', 'Data is encrypted in transit, access is limited through role-based authorisation, and sensitive keys are kept in secure on-device storage. No system is entirely risk-free; in the event of a breach, notifications required by law will be made.'), changesParagraph],
      },
    ],
  },
  'dua-terms': {
    eyebrow: l('DuaAPP / yasal', 'DuaAPP / legal'),
    title: l('DuaAPP kullanım koşulları', 'DuaAPP terms of use'),
    intro: l(
      'Bu koşullar DuaAPP’in dua, günlük, yapay zekâ ve topluluk özelliklerini kullanırken geçerli kuralları açıklar.',
      'These terms set out the rules that apply when using DuaAPP’s prayer, journal, AI, and community features.',
    ),
    date: updated,
    sections: [
      {
        heading: l('Hizmet ve hesap', 'Service and account'),
        paragraphs: [l('DuaAPP manevi destek ve bilgilendirme amacıyla sunulur. Hesap bilgilerinizin doğruluğundan ve giriş bilgilerinizin güvenliğinden siz sorumlusunuz. 13 yaşın altındaysanız uygulamayı kullanamazsınız; ülkenizde daha yüksek bir yaş sınırı varsa ebeveyn veya vasi izni gerekir.', 'DuaAPP is offered for spiritual support and information. You are responsible for accurate account information and for protecting your credentials. If you are under 13 you may not use the app; where your country sets a higher age, parental or guardian consent is required.')],
      },
      {
        heading: l('Dini ve tıbbi içerik uyarısı', 'Religious and medical content notice'),
        paragraphs: [l('Uygulamadaki dua, metin, takvim ve açıklamalar bilgilendirme amaçlıdır; yetkin bir din görevlisinin, hekimin, psikoloğun veya hukukçunun görüşünün yerine geçmez. Rüya yorumları ve yapay zekâ çıktıları kesinlik taşımaz. Acil bir sağlık veya kriz durumunda yerel acil yardım birimlerine başvurun.', 'Prayers, texts, calendars, and explanations in the app are informational and do not replace the advice of a qualified religious scholar, physician, psychologist, or lawyer. Dream interpretations and AI output are not definitive. In a medical or crisis emergency, contact local emergency services.')],
      },
      {
        heading: l('Yapay zekâ özellikleri', 'AI features'),
        paragraphs: [l('Sohbet ve dua üretimi yapay zekâ modelleriyle sağlanır; çıktılar hatalı, eksik veya uygunsuz olabilir ve doğruluğu garanti edilmez. Kararlarınız için çıktıya tek başına güvenmeyin. Yapay zekâ girdileriniz hizmeti sunmak için işlenir; ayrıntılar gizlilik politikasındadır.', 'Chat and prayer generation use AI models; outputs may be wrong, incomplete, or inappropriate and are not guaranteed accurate. Do not rely on output alone for decisions. Your AI inputs are processed to provide the service; details are in the privacy policy.')],
      },
      {
        heading: l('Topluluk kuralları ve içerik', 'Community rules and content'),
        paragraphs: [l('Taciz, nefret söylemi, bir inanç veya topluluğu aşağılama, şiddet veya yasa dışı faaliyeti teşvik, kişisel verileri izinsiz paylaşma, spam, kimliğe bürünme ve çocukları istismar eden içerik yasaktır. Paylaştığınız içerik size aittir; ancak hizmeti işletmek için bu içeriği barındırma, gösterme ve moderasyon amacıyla işleme konusunda bize sınırlı ve münhasır olmayan bir lisans verirsiniz. Yapay zekâ ve insan moderasyonu uygulanabilir; kural ihlalinde içerik kaldırılabilir veya hesap kısıtlanabilir/kapatılabilir.', 'Harassment, hate speech, demeaning a belief or community, promoting violence or unlawful activity, sharing personal data without permission, spam, impersonation, and content exploiting children are prohibited. You keep ownership of what you post, but grant us a limited, non-exclusive licence to host, display, and moderate it in order to run the service. AI and human moderation may apply; content may be removed and accounts restricted or closed for violations.')],
      },
      {
        heading: l('Abonelik ve ödemeler', 'Subscriptions and payments'),
        paragraphs: [l('Ücretsiz sürümde Google AdMob reklamları gösterilebilir; reklam işleme ayrıntıları gizlilik politikasındadır. Ücretli özellikler Google Play üzerinden satın alınır; fiyat, süre ve yenileme koşulları satın alma ekranında gösterilir ve iptal/iade işlemleri Google Play üzerinden yapılır. Yasal cayma ve iade hakları saklıdır.', 'The free version may show Google AdMob ads; ad-processing details are in the privacy policy. Paid features are bought through Google Play; price, period, and renewal terms are shown at purchase, and cancellation and refunds are handled through Google Play. Statutory withdrawal and refund rights are unaffected.')],
      },
      {
        heading: l('Fikri mülkiyet', 'Intellectual property'),
        paragraphs: [l('Uygulamanın tasarımı, yazılımı ve özgün içeriği ACKARACA veya lisans verenlerine aittir. Kutsal metinler ve klasik dua metinleri kendi kaynaklarına ve çevirmenlerine ait haklara tabi olabilir. Uygulamayı kopyalayamaz, tersine mühendislik yapamaz, otomatik yöntemlerle veri çekemez veya güvenlik önlemlerini aşamazsınız.', 'The app’s design, software, and original content belong to ACKARACA or its licensors. Holy texts and classical prayers may be subject to rights of their sources and translators. You may not copy, reverse engineer, scrape, or bypass security measures.')],
      },
      {
        heading: l('Askıya alma, sorumluluk ve hukuk', 'Suspension, liability, and governing law'),
        paragraphs: [l('Hizmet “olduğu gibi” sunulur; kesintisiz veya hatasız olacağı garanti edilmez. Kanunun izin verdiği ölçüde dolaylı kayıplardan sorumluluk kabul edilmez; kanunen sınırlandırılamayan sorumluluklar saklıdır. Hesabınızı istediğiniz zaman silebilirsiniz; kural ihlali halinde erişiminizi askıya alabiliriz. Bu koşullara Türkiye Cumhuriyeti hukuku uygulanır; tüketici mevzuatının zorunlu hükümleri saklıdır.', 'The service is provided “as is” without a guarantee of uninterrupted or error-free operation. To the extent permitted by law, liability for indirect loss is excluded; liability that cannot legally be limited is unaffected. You may delete your account at any time; we may suspend access for violations. These terms are governed by the law of the Republic of Türkiye, without prejudice to mandatory consumer-protection rules.')],
      },
      {
        heading: l('Değişiklikler', 'Changes'),
        paragraphs: [changesParagraph],
      },
    ],
  },
  'drawordie-privacy': {
    eyebrow: l('Draw or Die / yasal', 'Draw or Die / legal'),
    title: l('Draw or Die gizlilik politikası', 'Draw or Die privacy policy'),
    intro: l(
      'Draw or Die, mimarlık öğrencileri için yapay zekâ destekli jüri simülasyonu sunar. Bu politika yüklediğiniz çalışmalar, hesap ve ödeme verilerinin nasıl işlendiğini açıklar.',
      'Draw or Die offers an AI-assisted jury simulation for architecture students. This policy explains how your uploaded work, account, and payment data is processed.',
    ),
    date: updated,
    sections: [
      {
        heading: l('İşlenen veriler', 'Data we process'),
        paragraphs: [l('Hizmet yalnızca kullandığınız özellikler için gerekli veriyi işler:', 'The service processes only the data needed for the features you use:')],
        items: [
          l('Hesap: kullanıcı kimliği, e-posta, görünen ad ve profil bilgileri; misafir kullanımda anonim oturum kimliği.', 'Account: user ID, email, display name, and profile information; an anonymous session ID for guest use.'),
          l('Çalışmalarınız: yüklediğiniz pafta, render, çizim ve PDF dosyaları, etiketler, istemler, jüri eleştirileri, savunma ve mentor sohbetleri ile proje geçmişi.', 'Your work: the sheets, renders, drawings, and PDFs you upload, labels, prompts, jury critiques, defence and mentor chats, and project history.'),
          l('Eğitim doğrulaması (isteğe bağlı): öğrenci e-postası ve tek kullanımlık doğrulama kodu; kod yalnızca kısa ömürlü anahtarlı özet olarak saklanır.', 'Education verification (optional): student email and a one-time verification code; the code is stored only as a short-lived keyed hash.'),
          l('Ödeme ve Rapido kredisi: Stripe müşteri/abonelik/fatura referansları, satın alma, kazanım ve harcama kayıtları. Kart bilgilerinizi Stripe işler, biz görmeyiz.', 'Payments and Rapido credits: Stripe customer, subscription, and invoice references, and purchase, earn, and spend records. Stripe handles your card details; we never see them.'),
          l('Topluluk ve iş birliği: yalnızca siz yayımlamayı seçerseniz galeri gönderileri; Peer Review, arkadaş ekibi üyeliği ve paylaşılan projeler.', 'Community and collaboration: gallery posts only if you choose to publish; Peer Review, friends-team membership, and shared projects.'),
          l('Teknik veri: kötüye kullanım önleme, güvenlik ve hata kayıtları, çerez/yerel depolama tercihleri ve kullanım olayları.', 'Technical data: abuse-prevention, security, and error logs, cookie/local-storage preferences, and usage events.'),
          l('Reklam: Draw or Die reklam ağı veya reklam SDK’sı kullanmaz, reklam kimliği toplamaz ve verilerinizi reklam amacıyla paylaşmaz ya da satmaz.', 'Advertising: Draw or Die uses no ad network or ad SDK, does not collect advertising IDs, and does not share or sell your data for advertising.'),
        ],
      },
      {
        heading: l('Yapay zekâ işleme', 'AI processing'),
        paragraphs: [l('Yüklediğiniz çalışmalar ve istemler, analiz, jüri yorumu, revizyon ve mentor yanıtları üretmek için Vercel AI Gateway üzerinden bağlı yapay zekâ model sağlayıcılarına (ör. Google Gemini modelleri) gönderilir. Çıktılar yapay zekâ tarafından üretilir, hatalı olabilir ve profesyonel veya akademik değerlendirmenin yerine geçmez. Çalışmalarınız herkese açık galeriye otomatik olarak eklenmez.', 'Your uploaded work and prompts are sent to AI model providers (for example Google Gemini models) reached through Vercel AI Gateway to generate analyses, jury comments, revisions, and mentor replies. Outputs are AI-generated, may be wrong, and do not replace professional or academic assessment. Your work is not added to the public gallery automatically.')],
      },
      {
        heading: l('Açık rıza ile galeri yayını', 'Gallery publishing by explicit consent'),
        paragraphs: [l('Hiçbir çalışma siz açıkça yayımla eylemini yapmadan galeriye yazılmaz. Rızanın kapsamı, sürümü ve zamanı kaydedilir; yayını istediğiniz zaman kaldırarak rızanızı geri çekebilirsiniz. Yayımlanan içerik diğer kullanıcılara ve ziyaretçilere görünür ve geri alınmadan önce kopyalanmış olabilir.', 'No work is written to the gallery until you take an explicit publish action. The scope, version, and time of consent are recorded; you can withdraw consent at any time by unpublishing. Published content is visible to other users and visitors and may have been copied before removal.')],
      },
      {
        heading: l('Hizmet sağlayıcılar ve aktarım', 'Service providers and transfers'),
        paragraphs: [l('Appwrite (kimlik doğrulama, veritabanı, dosya depolama), Stripe (ödemeler), Vercel (barındırma ve AI Gateway) ve bağlı yapay zekâ model sağlayıcıları verileri bizim adımıza veya kendi sorumluluklarıyla işler. Veriler Türkiye dışındaki ülkelere aktarılabilir; aktarımlar uygulanabilir mevzuattaki güvencelere (standart sözleşme maddeleri, açık rıza vb.) dayanır. Kişisel verileriniz satılmaz.', 'Appwrite (authentication, database, file storage), Stripe (payments), Vercel (hosting and AI Gateway), and the connected AI model providers process data on our behalf or under their own responsibility. Data may be transferred outside Türkiye on the basis of safeguards available under applicable law (standard contractual clauses, explicit consent, etc.). Your personal data is not sold.')],
      },
      {
        heading: l('Hukuki dayanaklar ve amaçlar', 'Legal bases and purposes'),
        paragraphs: [l('Verileri hizmeti sunmak, ödemeleri ve kredi bakiyesini doğru tutmak, kötüye kullanım ve dolandırıcılığı önlemek, güvenliği sağlamak ve hizmeti geliştirmek için işleriz. Dayanaklar: sözleşmenin ifası, açık rıza (galeri yayını, isteğe bağlı çerezler), meşru menfaat (güvenlik ve kötüye kullanım önleme) ve hukuki yükümlülüklerdir (ör. fatura ve vergi kayıtları).', 'We process data to provide the service, keep payments and credit balances accurate, prevent abuse and fraud, ensure security, and improve the service. Bases: contract performance, explicit consent (gallery publishing, optional cookies), legitimate interests (security and abuse prevention), and legal obligations (for example invoice and tax records).')],
      },
      {
        heading: l('Saklama ve silme', 'Retention and deletion'),
        paragraphs: [l('Hesap, proje ve çalışma verileri hesabınız açık olduğu sürece saklanır. Hesap silme talebinde hesabınız ve ilişkili içerik silinir veya geri döndürülemez biçimde anonimleştirilir; yasal yükümlülük (ör. ödeme ve fatura kayıtları), dolandırıcılık önleme veya uyuşmazlık çözümü için gerekli sınırlı kayıtlar gerekli süre boyunca tutulabilir. Misafir verileri sınırlı süre sonra temizlenebilir. Hesap silme için ürün içi seçeneği ya da hesap silme sayfasını kullanın.', 'Account, project, and work data is kept while your account is open. On an account-deletion request, your account and associated content are deleted or irreversibly anonymised; limited records needed for legal obligations (for example payment and invoice records), fraud prevention, or dispute resolution may be retained as long as necessary. Guest data may be purged after a limited period. Use the in-product option or the account-deletion page to delete your account.')],
      },
      {
        heading: l('Haklarınız', 'Your rights'),
        paragraphs: [rightsParagraph],
      },
      {
        heading: l('Çocuklar ve güvenlik', 'Children and security'),
        paragraphs: [l('Hizmet 13 yaşın altındaki çocuklara yönelik değildir; ülkenizde daha yüksek bir dijital rıza yaşı varsa ebeveyn veya vasi izni gerekir. Veriler aktarım sırasında şifrelenir, erişim sahiplik ve rol kontrolleriyle sınırlandırılır ve ödeme olayları imza doğrulamasıyla işlenir. Hiçbir sistem tamamen risksiz değildir; bir ihlal durumunda mevzuatın gerektirdiği bildirimler yapılır.', 'The service is not directed at children under 13; where your country sets a higher digital age of consent, parental or guardian consent is required. Data is encrypted in transit, access is limited through ownership and role checks, and payment events are handled with signature verification. No system is entirely risk-free; in the event of a breach, notifications required by law will be made.'), changesParagraph],
      },
    ],
  },
  'drawordie-terms': {
    eyebrow: l('Draw or Die / yasal', 'Draw or Die / legal'),
    title: l('Draw or Die kullanım koşulları', 'Draw or Die terms of use'),
    intro: l(
      'Bu koşullar Draw or Die jüri simülasyonunu, Rapido kredilerini, topluluk ve iş birliği özelliklerini kullanırken geçerli kuralları açıklar.',
      'These terms set out the rules that apply when using the Draw or Die jury simulation, Rapido credits, and community and collaboration features.',
    ),
    date: updated,
    sections: [
      {
        heading: l('Hizmet ve hesap', 'Service and account'),
        paragraphs: [l('Draw or Die, mimarlık öğrencilerine yapay zekâ destekli geri bildirim sunan bir eğitim aracıdır. Hesap bilgilerinizin doğruluğundan ve giriş bilgilerinizin güvenliğinden siz sorumlusunuz; hesabınızı başkasıyla paylaşamaz veya başkasının hesabını izinsiz kullanamazsınız. 13 yaşın altındaysanız hizmeti kullanamazsınız; ülkenizde daha yüksek bir yaş sınırı varsa ebeveyn veya vasi izni gerekir.', 'Draw or Die is an educational tool that gives architecture students AI-assisted feedback. You are responsible for accurate account information and for protecting your credentials; you may not share your account or use someone else’s without permission. If you are under 13 you may not use the service; where your country sets a higher age, parental or guardian consent is required.')],
      },
      {
        heading: l('Yapay zekâ çıktısı', 'AI output'),
        paragraphs: [l('Jüri yorumları, puanlar, revizyon önerileri ve mentor yanıtları yapay zekâ tarafından üretilir; hatalı, eksik veya taraflı olabilir ve gerçek bir jürinin, eğitmenin ya da meslek insanının değerlendirmesinin yerine geçmez. Akademik, mesleki veya yapısal kararlar için çıktıya tek başına güvenmeyin; sonuçlardan siz sorumlusunuz.', 'Jury comments, scores, revision suggestions, and mentor replies are AI-generated; they may be wrong, incomplete, or biased and do not replace the assessment of a real jury, instructor, or professional. Do not rely on output alone for academic, professional, or structural decisions; you are responsible for outcomes.')],
      },
      {
        heading: l('Yüklediğiniz içerik', 'Content you upload'),
        paragraphs: [l('Yüklediğiniz çalışmaların hakları size (veya hak sahibine) aittir ve gerekli izinlere sahip olduğunuzu beyan edersiniz. Hizmeti sunmak için içeriği barındırma, yapay zekâ sağlayıcılarına iletme ve işleme konusunda bize sınırlı, münhasır olmayan bir lisans verirsiniz. Çalışmalarınız yalnızca siz açıkça yayımlarsanız galeride görünür; yayını istediğiniz zaman kaldırabilirsiniz. Başkasına ait çalışmayı, yasa dışı, istismar içeren veya zararlı içeriği yükleyemezsiniz.', 'You keep the rights to the work you upload (or they remain with the rights holder), and you represent that you have the necessary permissions. You grant us a limited, non-exclusive licence to host, send to AI providers, and process it in order to provide the service. Your work appears in the gallery only if you explicitly publish it, and you can unpublish at any time. You may not upload work belonging to others, or unlawful, abusive, or harmful content.')],
      },
      {
        heading: l('Rapido kredileri ve ödemeler', 'Rapido credits and payments'),
        paragraphs: [l('Rapido, hizmet içi analizler için kullanılan sanal kredidir; nakit değeri yoktur, paraya çevrilemez ve devredilemez. Krediler ve abonelikler Stripe üzerinden satın alınır; fiyat, vergi, süre ve yenileme koşulları ödeme ekranında gösterilir ve abonelikler dönem sonunda iptal edilmediği sürece yenilenir. Kullanılan krediler iade edilmez; yasal cayma ve iade hakları ile hatalı tahsilatlar için düzeltme hakkı saklıdır. Promosyon ve referans kredileri doğrulanmış kimlik ve tek kullanım koşullarına bağlıdır; kötüye kullanım halinde iptal edilebilir.', 'Rapido is a virtual credit used for in-service analyses; it has no cash value and cannot be exchanged for money or transferred. Credits and subscriptions are bought through Stripe; price, tax, period, and renewal terms are shown at checkout, and subscriptions renew unless cancelled before the period ends. Spent credits are not refunded; statutory withdrawal and refund rights, and correction of erroneous charges, are unaffected. Promotional and referral credits depend on verified identity and one-time-use conditions and may be cancelled for abuse.')],
      },
      {
        heading: l('Topluluk, Peer Review ve iş birliği', 'Community, Peer Review, and collaboration'),
        paragraphs: [l('Taciz, nefret söylemi, kişisel veri ifşası, intihal, başkasının çalışmasını kendi çalışması gibi sunma, spam, referans veya kredi istismarı ve otomatik araçlarla manipülasyon yasaktır. Arkadaş ekiplerinde ekip yöneticisi harcama yetkisini ve üyeliği yönetir; üyeler paylaşılan projelerdeki içerikten sorumludur. İhlal halinde içerik kaldırılabilir, kredi iptal edilebilir ve hesap kısıtlanabilir veya kapatılabilir.', 'Harassment, hate speech, disclosure of personal data, plagiarism, passing off others’ work as your own, spam, referral or credit abuse, and automated manipulation are prohibited. In friends teams the team owner manages spend authority and membership; members are responsible for content in shared projects. For violations, content may be removed, credits cancelled, and accounts restricted or closed.')],
      },
      {
        heading: l('Fikri mülkiyet ve kabul edilebilir kullanım', 'Intellectual property and acceptable use'),
        paragraphs: [l('Hizmetin yazılımı, tasarımı, markası ve özgün içeriği ACKARACA veya lisans verenlerine aittir. Hizmeti kopyalayamaz, tersine mühendislik yapamaz, güvenlik önlemlerini veya hız sınırlarını aşamaz, otomatik yöntemlerle veri çekemez ya da yapay zekâ modellerini hizmetin dışında yeniden eğitmek için çıktıyı toplu biçimde kullanamazsınız.', 'The service’s software, design, brand, and original content belong to ACKARACA or its licensors. You may not copy or reverse engineer it, bypass security measures or rate limits, scrape it, or harvest output in bulk to train AI models outside the service.')],
      },
      {
        heading: l('Askıya alma, sorumluluk ve hukuk', 'Suspension, liability, and governing law'),
        paragraphs: [l('Hizmet “olduğu gibi” sunulur; kesintisiz, hatasız veya belirli bir sonucu garanti edecek şekilde çalışacağı taahhüt edilmez. Kanunun izin verdiği ölçüde dolaylı kayıplardan, yapay zekâ çıktısına dayanmaktan doğan zararlardan sorumluluk kabul edilmez; kanunen sınırlandırılamayan sorumluluklar saklıdır. Hesabınızı istediğiniz zaman silebilirsiniz; kural ihlalinde erişiminizi askıya alabiliriz. Bu koşullara Türkiye Cumhuriyeti hukuku uygulanır; tüketici mevzuatının zorunlu hükümleri saklıdır. Veri işleme Draw or Die gizlilik politikasında açıklanır.', 'The service is provided “as is” without a promise that it will be uninterrupted, error-free, or produce a particular result. To the extent permitted by law, liability is excluded for indirect loss and for harm arising from reliance on AI output; liability that cannot legally be limited is unaffected. You may delete your account at any time; we may suspend access for violations. These terms are governed by the law of the Republic of Türkiye, without prejudice to mandatory consumer-protection rules. Data processing is described in the Draw or Die privacy policy.')],
      },
      {
        heading: l('Değişiklikler', 'Changes'),
        paragraphs: [changesParagraph],
      },
    ],
  },
};
