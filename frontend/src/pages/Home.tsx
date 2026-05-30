import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SEOHead } from '@/components/common/SEOHead';
import { SampleCard } from '@/components/product/SampleCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { samplesService } from '@/services/products.service';
import {
  SHOP_ADDRESS,
  SHOP_EMAIL,
  SHOP_HOTLINE_HREF,
  SHOP_HOTLINE,
  SHOP_NAME,
  SHOP_PROMISES,
  SHOP_SERVICE_LINE,
  SHOP_SHORT_NAME,
  SHOP_TAGLINE,
  SHOP_ZALO_HREF,
  SITE_URL,
} from '@/lib/site';
import {
  ArrowRight,
  BadgeCheck,
  Eye,
  Layers3,
  MessageCircle,
  PackageCheck,
  Palette,
  PhoneCall,
  ShieldCheck,
  ScanLine,
  Sparkles,
  Wand2,
} from 'lucide-react';

const effects = [
  { label: 'Flip', text: 'Đổi hình theo góc nhìn', color: 'bg-primary' },
  { label: 'Depth', text: 'Tạo chiều sâu nhiều lớp', color: 'bg-[#8b5cf6]' },
  { label: 'Motion', text: 'Gợi chuyển động ảo', color: 'bg-[#fb923c]' },
];

const salesSignals = [
  { value: '3 hiệu ứng', label: 'Flip / Depth / Motion' },
  { value: '1:1', label: 'Tư vấn theo nội dung ảnh' },
  { value: 'Toàn quốc', label: 'Hỗ trợ gửi mẫu và giao nhận' },
];

const conversionReasons = [
  { title: 'Dễ hình dung trước khi làm', text: 'Xem mẫu ảnh nổi 3D lenticular có sẵn để chọn hiệu ứng gần nhất với nhu cầu.', icon: Eye },
  { title: 'Phù hợp chiến dịch nhỏ và lớn', text: 'Có thể bắt đầu từ quà tặng thương hiệu, POSM, standee mica hoặc bộ sưu tập.', icon: PackageCheck },
  { title: 'Tư vấn nhanh qua Zalo', text: 'Gửi ảnh, ý tưởng và kích thước để được gợi ý hiệu ứng flip, depth hoặc motion.', icon: MessageCircle },
];

const useCases = [
  { title: 'Quà tặng thương hiệu', text: 'In ảnh nổi 3D cho quà tặng, thẻ sưu tầm, postcard hoặc vật phẩm nhận diện dễ nhớ.', icon: PackageCheck },
  { title: 'POSM & trưng bày', text: 'Thiết kế POSM lenticular, standee mica và vật phẩm trưng bày tạo hiệu ứng khi đổi góc nhìn.', icon: ScanLine },
  { title: 'Bộ sưu tập cá nhân', text: 'Biến nhân vật, khoảnh khắc hoặc artwork thành mẫu flip, depth, motion có chiều sâu.', icon: Wand2 },
];

const processSteps = [
  { title: 'Chọn hướng nhìn', text: 'Xác định ảnh flip, ảnh depth hoặc thẻ motion phù hợp với nội dung cần thể hiện.' },
  { title: 'Dựng lớp hình', text: 'Tách layer, kiểm tra bố cục và tối ưu file in lenticular để hiệu ứng rõ hơn.' },
  { title: 'Hoàn thiện mẫu', text: 'Chốt kích thước, chất liệu, số lượng và phiên bản tham khảo trước khi sản xuất.' },
];

const serviceHighlights = [
  {
    title: 'In ảnh nổi 3D lenticular',
    text: 'Tạo chiều sâu hoặc chuyển ảnh khi người xem thay đổi góc nhìn, phù hợp quà tặng, card và hình trưng bày.',
    icon: Layers3,
  },
  {
    title: 'Standee mica và vật phẩm trưng bày',
    text: 'Thiết kế mẫu đứng, đế mica, POSM và vật phẩm để bàn cho sự kiện, booth, showroom hoặc chiến dịch thương hiệu.',
    icon: ShieldCheck,
  },
  {
    title: 'Thiết kế hiệu ứng flip, depth, motion',
    text: 'Tư vấn cách xử lý hình ảnh, tách lớp và chọn hiệu ứng để mẫu in rõ chuyển động, rõ chiều sâu.',
    icon: Wand2,
  },
];

const faqItems = [
  {
    question: 'Ảnh nổi 3D lenticular phù hợp với nhu cầu nào?',
    answer: 'Ảnh nổi 3D lenticular phù hợp làm quà tặng thương hiệu, thẻ sưu tầm, standee mica, POSM trưng bày, vật phẩm sự kiện và các mẫu hình cần tạo cảm giác chiều sâu hoặc chuyển động.',
  },
  {
    question: 'Nên chọn hiệu ứng flip, depth hay motion?',
    answer: 'Flip phù hợp khi muốn chuyển giữa hai hoặc nhiều hình, depth phù hợp khi cần chiều sâu nhiều lớp, motion phù hợp khi muốn tạo cảm giác chuyển động khi nghiêng sản phẩm.',
  },
  {
    question: 'Lenti Lab có nhận tư vấn file trước khi in không?',
    answer: 'Có. Bạn có thể gửi hình ảnh, ý tưởng, kích thước và số lượng qua Zalo để được gợi ý hiệu ứng, chất liệu và hướng dựng file phù hợp trước khi sản xuất.',
  },
];

export default function Home() {
  const { data: samples = [] } = useQuery({
    queryKey: ['samples', 'home-preview'],
    queryFn: () => samplesService.getAll(),
  });

  const featuredSamples = samples.slice(0, 4);
  const homeUrl = SITE_URL || '/';
  const logoUrl = SITE_URL ? `${SITE_URL}/img/logo.jpg` : '/img/logo.jpg';

  return (
    <>
      <SEOHead
        title="Ảnh nổi 3D Lenticular, Standee Mica | Lenti Lab"
        description="Lenti Lab thiết kế, in ảnh nổi 3D lenticular, standee mica, ảnh flip/depth/motion và POSM thương hiệu tại TPHCM, tư vấn toàn quốc."
        canonicalPath="/"
        image="/img/logo.jpg"
        keywords={[
          'in ảnh nổi 3D TPHCM',
          'làm standee mica',
          'in ảnh lenticular Việt Nam',
          'thiết kế ảnh 3D lenticular',
          'POSM lenticular thương hiệu',
          'quà tặng thương hiệu 3D',
        ]}
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: SHOP_SHORT_NAME,
            legalName: SHOP_NAME,
            description: 'Thiết kế và in ảnh nổi 3D lenticular, standee mica, ảnh flip, ảnh depth, thẻ motion và POSM thương hiệu.',
            url: homeUrl,
            image: logoUrl,
            telephone: SHOP_HOTLINE,
            email: SHOP_EMAIL,
            address: {
              '@type': 'PostalAddress',
              streetAddress: SHOP_ADDRESS,
              addressLocality: 'Ho Chi Minh City',
              addressCountry: 'VN',
            },
            areaServed: [
              { '@type': 'City', name: 'Ho Chi Minh City' },
              { '@type': 'Country', name: 'Vietnam' },
            ],
            makesOffer: serviceHighlights.map((item) => ({
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: item.title,
                description: item.text,
              },
            })),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Trang chủ',
                item: homeUrl,
              },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          },
        ]}
      />

      <section className="home-creative relative overflow-hidden px-4 pb-14 pt-8 md:pb-20 md:pt-14">
        <div className="pointer-events-none absolute left-[6%] top-12 h-28 w-28 rounded-[2rem] border border-primary/15 bg-white/80 shadow-[18px_18px_0_rgba(253,20,63,0.08)] rotate-[-10deg]" />
        <div className="pointer-events-none absolute right-[7%] top-28 h-20 w-20 rounded-full bg-[#8b5cf6]/12 blur-2xl" />
        <div className="pointer-events-none absolute bottom-12 left-[42%] h-24 w-24 rounded-full bg-[#fb923c]/14 blur-2xl" />

        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,1fr)] lg:items-center">
          <div className="relative z-10 space-y-8">
            <Badge className="w-fit rounded-full border border-primary/15 bg-white px-4 py-2 text-primary shadow-[0_12px_32px_rgba(253,20,63,0.1)] hover:bg-white">
              <Sparkles className="h-3.5 w-3.5" />
              {SHOP_SERVICE_LINE}
            </Badge>

            <div className="space-y-5">
              <p className="text-xs font-black uppercase tracking-[0.32em] text-primary">{SHOP_SHORT_NAME}</p>
              <h1 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-normal text-[#9f1239] md:text-7xl">
                In ảnh nổi 3D lenticular, nhìn nghiêng là thấy chuyển động.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[#7f1d3a] md:text-lg">
                {SHOP_TAGLINE} Nhận tư vấn ảnh flip, ảnh depth, thẻ motion, standee mica và POSM lenticular cho khách hàng tại TPHCM và toàn quốc.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="rounded-xl bg-primary text-white shadow-[0_18px_38px_rgba(253,20,63,0.24)] hover:bg-primary/90" asChild>
                <Link to="/products">
                  Khám phá sản phẩm
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl border-primary/20 bg-white text-primary shadow-sm hover:bg-primary/5"
                asChild
              >
                <a href={SHOP_ZALO_HREF}>
                  <MessageCircle className="h-4 w-4" />
                  Tư vấn ý tưởng
                </a>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="rounded-xl bg-white/80 text-[#be123c] shadow-sm hover:bg-white hover:text-primary"
                asChild
              >
                <a href={SHOP_HOTLINE_HREF}>
                  <PhoneCall className="h-4 w-4" />
                  Gọi tư vấn nhanh
                </a>
              </Button>
            </div>

            <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
              {salesSignals.map((item) => (
                <div key={item.value} className="rounded-2xl border border-primary/10 bg-white/75 px-4 py-3 shadow-[0_14px_34px_rgba(253,20,63,0.07)] backdrop-blur">
                  <p className="text-xl font-black text-[#be123c]">{item.value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#7f1d3a]/65">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
              {effects.map((item) => (
                <div key={item.label} className="rounded-2xl border border-primary/10 bg-white/85 p-4 shadow-[0_18px_44px_rgba(253,20,63,0.08)] backdrop-blur">
                  <span className={`block h-2 w-10 rounded-full ${item.color}`} />
                  <p className="mt-4 text-2xl font-black text-[#be123c]">{item.label}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[#9f1239]/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-0 min-h-[460px] overflow-hidden rounded-[2rem] px-4 py-8 sm:min-h-[540px] lg:min-h-[620px]" aria-label="Minh họa hiệu ứng lenticular dạng 2D nhiều lớp">
            <div className="home-tilt-card relative mx-auto w-full max-w-[460px] rounded-[2rem] border border-primary/12 bg-white p-5 shadow-[0_34px_90px_rgba(253,20,63,0.18)] sm:max-w-[500px]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,#fff1f4,#ffffff_38%,#fff7ed_70%,#f5f3ff)]">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(253,20,63,0.12)_0_1px,transparent_1px_12px)]" />
                <div className="home-float-slow absolute left-6 top-7 h-24 w-24 rounded-[1.5rem] bg-primary/88 shadow-[12px_12px_0_rgba(251,146,60,0.22)] sm:h-32 sm:w-32 sm:rounded-[2rem]" />
                <div className="home-float absolute right-6 top-20 h-20 w-20 rounded-full bg-[#8b5cf6]/78 shadow-[10px_10px_0_rgba(253,20,63,0.1)] sm:h-24 sm:w-24" />
                <div className="home-float-slower absolute bottom-16 left-7 h-24 w-36 rounded-[1.5rem] bg-[#fb923c]/84 shadow-[12px_12px_0_rgba(139,92,246,0.14)] sm:h-28 sm:w-44" />
                <div className="absolute bottom-7 right-6 rounded-full bg-white/88 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary shadow-lg">
                  2D Layered 3D
                </div>
              </div>
            </div>

            <div className="absolute left-3 top-24 hidden w-40 rounded-3xl border border-primary/10 bg-white/94 p-4 shadow-[14px_14px_0_rgba(253,20,63,0.08)] backdrop-blur xl:block">
              <Eye className="h-6 w-6 text-primary" />
              <p className="mt-5 text-base font-black text-[#be123c]">Góc nhìn đổi cảm giác.</p>
            </div>

            <div className="absolute bottom-24 right-4 hidden w-44 rounded-3xl border border-[#8b5cf6]/15 bg-white/94 p-4 shadow-[14px_14px_0_rgba(139,92,246,0.12)] backdrop-blur xl:block">
              <Layers3 className="h-6 w-6 text-[#8b5cf6]" />
              <p className="mt-5 text-base font-black text-[#6d28d9]">Layer tạo chiều sâu.</p>
            </div>

            <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[#fb923c]/20 bg-white px-4 py-3 shadow-[0_20px_44px_rgba(251,146,60,0.16)]">
              <Palette className="h-5 w-5 text-[#fb923c]" />
              <span className="text-sm font-black text-[#c2410c]">Đỏ / Cam / Tím</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8">
        <div className="mx-auto grid max-w-7xl gap-4 rounded-[2rem] border border-primary/10 bg-white p-4 shadow-[0_24px_70px_rgba(253,20,63,0.1)] md:grid-cols-3 md:p-5">
          {conversionReasons.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className={`rounded-[1.5rem] p-5 ${index === 1 ? 'bg-[#f5f3ff]' : index === 2 ? 'bg-[#fff7ed]' : 'bg-[#fff7f9]'}`}>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${index === 1 ? 'bg-[#8b5cf6]/12 text-[#7c3aed]' : index === 2 ? 'bg-[#fb923c]/14 text-[#ea580c]' : 'bg-primary/10 text-primary'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-lg font-black text-[#be123c]">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#7f1d3a]/75">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-4 py-10 md:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 max-w-3xl">
            <Badge className="rounded-full bg-primary/10 px-3 py-1.5 text-primary hover:bg-primary/10">
              Dịch vụ chính
            </Badge>
            <h2 className="mt-4 text-3xl font-black text-[#be123c] md:text-5xl">Thiết kế và in lenticular cho sản phẩm cần tạo ấn tượng.</h2>
            <p className="mt-3 text-sm leading-7 text-[#7f1d3a]/75 md:text-base">
              Lenti Lab tập trung vào ảnh nổi 3D, standee mica, vật phẩm trưng bày và POSM có hiệu ứng thị giác rõ khi người xem thay đổi góc nhìn.
            </p>
          </div>
          <div className="mb-4 grid gap-4 md:grid-cols-3">
            {serviceHighlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-[2rem] border border-primary/10 bg-white p-6 shadow-[0_18px_50px_rgba(253,20,63,0.08)]">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${index === 1 ? 'bg-[#8b5cf6]/10 text-[#7c3aed]' : index === 2 ? 'bg-[#fb923c]/12 text-[#ea580c]' : 'bg-primary/10 text-primary'}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-black text-[#be123c]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#7f1d3a]">{item.text}</p>
                </div>
              );
            })}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {useCases.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="group rounded-[2rem] border border-primary/10 bg-white p-6 shadow-[0_18px_50px_rgba(253,20,63,0.08)] transition-colors duration-200 hover:border-primary/30 hover:bg-primary/4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="mt-6 text-xl font-black text-[#be123c]">{item.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-[#7f1d3a]">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div className="rounded-[2rem] bg-primary px-6 py-8 text-white shadow-[0_28px_70px_rgba(253,20,63,0.22)] md:p-8">
            <Badge className="rounded-full bg-white/16 px-3 py-1.5 text-white hover:bg-white/16">
              Quy trình
            </Badge>
            <h2 className="mt-5 text-3xl font-black tracking-normal md:text-5xl">Từ ảnh phẳng đến mẫu có chiều sâu.</h2>
            <p className="mt-4 text-base leading-7 text-white/86">Mỗi bước đều giúp hiệu ứng dễ nhìn hơn khi chuyển góc.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {processSteps.map((step, index) => (
              <div key={step.title} className="rounded-[2rem] border border-primary/10 bg-white p-6 shadow-[0_18px_50px_rgba(253,20,63,0.08)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff1f4] text-sm font-black text-primary">
                  {index + 1}
                </div>
                <h3 className="mt-6 text-lg font-black text-[#be123c]">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#7f1d3a]">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featuredSamples.length > 0 && (
        <section className="px-4 py-10 md:py-16">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <Badge className="rounded-full bg-primary/10 px-3 py-1.5 text-primary hover:bg-primary/10">
                  Mẫu nổi bật
                </Badge>
                <h2 className="mt-4 text-3xl font-black text-[#be123c] md:text-5xl">Một vài mẫu để bắt đầu.</h2>
              </div>
              <Button variant="outline" className="rounded-xl border-primary/20 bg-white text-primary hover:bg-primary/5" asChild>
                <Link to="/products">
                  Xem toàn bộ sản phẩm
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {featuredSamples.map((sample) => (
                <SampleCard key={sample.id} sample={sample} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 py-10 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {SHOP_PROMISES.map((promise, index) => (
            <div key={promise.title} className="rounded-[2rem] border border-primary/10 bg-white p-6 shadow-[0_18px_50px_rgba(253,20,63,0.06)]">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${index === 1 ? 'bg-[#8b5cf6]/10 text-[#8b5cf6]' : index === 2 ? 'bg-[#fb923c]/12 text-[#fb923c]' : 'bg-primary/10 text-primary'}`}>
                <BadgeCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-black text-[#be123c]">{promise.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#7f1d3a]">{promise.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-10 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <Badge className="rounded-full bg-primary/10 px-3 py-1.5 text-primary hover:bg-primary/10">
              Câu hỏi thường gặp
            </Badge>
            <h2 className="mt-4 text-3xl font-black text-[#be123c] md:text-5xl">Thông tin cần biết trước khi in ảnh nổi 3D.</h2>
            <p className="mt-3 text-sm leading-7 text-[#7f1d3a]/75 md:text-base">
              Những câu hỏi này giúp bạn chọn đúng hiệu ứng lenticular, chuẩn bị file ảnh và ước lượng hướng sản xuất trước khi trao đổi chi tiết.
            </p>
          </div>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <article key={item.question} className="rounded-[1.5rem] border border-primary/10 bg-white p-5 shadow-[0_16px_42px_rgba(253,20,63,0.06)]">
                <h3 className="text-base font-black text-[#9f1239]">{item.question}</h3>
                <p className="mt-2 text-sm leading-7 text-[#7f1d3a]/78">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 pt-6 md:pb-20">
        <div className="mx-auto overflow-hidden rounded-[2rem] bg-gradient-to-r from-primary via-[#ff4d6d] to-[#fb923c] px-6 py-8 text-white shadow-[0_30px_80px_rgba(253,20,63,0.24)] md:px-10 md:py-10 max-w-7xl">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-white/75">Bắt đầu nhanh</p>
              <h2 className="mt-3 text-3xl font-black md:text-5xl">Có ảnh hoặc ý tưởng rồi? Gửi để được gợi ý hiệu ứng.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/86">Chọn mẫu tham khảo hoặc gửi hình qua Zalo, Lenti Lab sẽ tư vấn hướng flip, depth hoặc motion phù hợp.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-2xl bg-white px-6 text-primary hover:bg-white/92">
                <a href={SHOP_ZALO_HREF}>
                  <MessageCircle className="h-4 w-4" />
                  Tư vấn Zalo
                </a>
              </Button>
              <Button asChild variant="outline" className="rounded-2xl border-white/40 bg-white/10 px-6 text-white hover:bg-white/18">
                <Link to="/products">
                  Xem mẫu
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
