// English catalog. Same shape as ko.ts (the compiler checks it).
// Terms and amounts follow docs/00-wmto-overview.md. Amounts stay in KRW on purpose.
// This is a working translation: have a native speaker review it before launch.
import { ko, type Messages } from "./ko";

export const en: Messages = {
  site: {
    tagline: "Self-Sustaining Mission Business Network",
    skip: "Skip to main content",
    manifestDescription: "Member app of the WMTO Self-Sustaining Mission Business Network",
    name: "WMTO Self-Sustaining Mission Business Network",
    short: "WMTO",
    description:
      "A business network where Christian business owners teach and missionaries stand on their own feet",
    footerLine: "Together with IM Mission",
    contact: "Contact: /en/apply?type=contact",
    privacy: "Privacy Policy",
  },
  verse: {
    ko: "It is more blessed to give than to receive.",
    en: "It is more blessed to give than to receive.",
    ref: "Acts 20:35",
    refEn: "Acts 20:35 (ESV)",
    footer: "It is more blessed to give than to receive. Acts 20:35 (ESV)",
    bandTitle: "“It is more blessed to give than to receive.”",
    bandCaption: "Acts 20:35 (ESV)",
  },
  nav: {
    items: [
      { href: "/about", label: "About" },
      { href: "/mentor", label: "Mentors" },
      { href: "/partner", label: "Partners" },
      { href: "/sponsor", label: "Sponsors" },
      { href: "/camp", label: "Camp" },
      { href: "/stories", label: "Stories" },
      { href: "/events", label: "Events" },
    ],
    cta: { href: "/apply?type=observe", label: "Observe a meeting" },
    menu: "Menu",
    close: "Close",
    main: "Main menu",
    mobile: "Mobile menu",
    switchTo: "한국어",
    switchLabel: "Switch to Korean",
  },
  footer: { fund: "Pass-It-On Fund", contact: "Contact" },
  common: { select: "Select", home: "Back to home" },
  meta: {
    about: "About",
    mentor: "Mentors",
    partner: "Partners",
    sponsor: "Sponsors",
    camp: "Philippines Training Camp",
    fund: "Pass-It-On Fund",
    stories: "Stories",
    events: "Events",
    apply: "Apply or Contact",
    privacy: "Privacy Policy",
  },
  alts: {
    hero: "A business owner at a coffee machine in a cafe",
    base: "The mission base in the Philippines",
  },
  labels: { step: "Step {n}", mission: "Mission {n}", week: "Week {n}", marquee: "WMTO's four core values" },
  notFound: {
    title: "We can't find that page",
    body: "The address may have changed, or the page may have been removed. Try starting again from the home page.",
    home: "Back to home",
    contact: "Contact us",
  },
  privacy: {
    title: "Privacy Policy",
    draft: "This is a draft.",
    draftNote: "Replace it with the final text after the operating body and legal counsel confirm it.",
    items: [
      "Data we collect: name, email, phone number, country of residence, and what you enter when you apply",
      "Purpose: receiving applications, providing consultation and guidance, running meetings and camps",
      "Retention: until the purpose is fulfilled (deleted without delay on request)",
      "Questions: please reach us through the Apply or Contact page.",
    ],
  },

  home: {
    hero: {
      eyebrow: "WMTO Self-Sustaining Mission Business Network",
      title: "Christian business owners teach.\nMissionaries stand on their own.",
      sub: "Your business experience becomes a missionary's self-reliance, and that self-reliance becomes a mission that does not stop.",
      verse: "More Blessed to Give - It is more blessed to give than to receive. (Acts 20:35)",
      buttons: [
        { label: "Are you a business owner?", href: "/mentor" },
        { label: "Are you a missionary?", href: "/partner" },
        { label: "Want to give?", href: "/sponsor" },
      ],
    },
    problem: {
      title: "Support alone cannot build a mission that does not stop",
      body: "Many missionaries consider laying down their ministry every time support declines. What the field needs is not more donations, but the strength to stand on its own.",
    },
    solution: {
      title: "A self-sustaining mission built by three kinds of people",
      items: [
        { name: "Business owners", en: "Mentor", text: "Share the skills and experience they have" },
        { name: "Sponsors", en: "Sponsor", text: "Open the way to get started" },
        { name: "Missionaries", en: "Partner", text: "Learn, start, and stand on their own" },
      ],
    },
    how: {
      title: "One person's experience builds up a mission field",
      body: "Mr. Kim, who has run a cafe for twenty years, taught coffee business for two weeks at the camp in the Philippines. A missionary in Cambodia learned there and opened a small cafe with KRW 3 million from the Pass-It-On Fund. A year later the cafe had become a ministry space where local young people gather, and the money the missionary repaid became the next missionary's start.",
      note: "This is an illustrative example",
      flow: [
        "Online meeting",
        "Philippines training camp",
        "1:1 mentoring",
        "Self-reliance",
        "Mentor to the next missionary",
      ],
      steps: [
        { name: "Online meeting", text: "Every two weeks for 60 minutes. Hear field reports from missionaries and share lectures from business owners.", detail: "First-time visitors are welcome to observe. Drop in once before you join and see how it feels.", points: ["A 60-second self-introduction helps everyone get to know each other", "Missionaries share their stories from the field in person", "A business owner teaches one topic"] },
        { name: "Philippines training camp", text: "Twice a year for three weeks at the mission base. Learn a business that fits the field and complete your plan.", detail: "Working Christian business owners come to teach in person. You learn skills you can use on the field by doing them.", points: ["Week 1, foundations: pricing, accounting, customers", "Week 2, specialty track: focused hands-on practice in your chosen field", "Week 3: finish your business plan, present it, and apply to the Pass-It-On Fund"] },
        { name: "1:1 mentoring", text: "Once a month, one business owner walks with one missionary to the end.", detail: "It does not end with one lecture. After you start, your mentor stays beside you to answer questions and walk with you.", points: ["You meet once a month to review how the business is going", "Every meeting is recorded in a mentoring log", "Your mentor walks with you when you receive Pass-It-On Fund support"] },
        { name: "Self-reliance", text: "The ministry continues on business income. The Pass-It-On Fund is repaid from a share of sales.", detail: "Once the first sales come in, follow-up support and sales connections continue. Repayment is shaped to fit your situation.", points: ["The Pass-It-On Fund is interest-free and repaid from a share of sales (5 to 10%)", "If the business struggles, repayment can be waived after a review", "A monthly self-reliance report lets you share each month's progress"] },
        { name: "Mentor to the next missionary", text: "A self-reliant missionary raises up the next one. The repaid fund becomes the next start.", detail: "One person's self-reliance does not end with them. It carries on to the next person.", points: ["The repaid fund becomes the next missionary's starting capital", "A self-reliant missionary joins as a mentor to the next one", "Where the fund has gone is shown openly"] },
      ],
    },
    camp: {
      title: "Learn in the Philippines, start in the mission field",
      body: "Twice a year, a three-week intensive training takes place at the mission base in the Philippines. Christian business owners come in person to teach business, marketing, digital skills, beauty, cooking, and other skills you can use in the field right away.",
      cta: { label: "Explore the camp", href: "/camp" },
    },
    fund: {
      title: "One gift keeps flowing",
      body: "Missionaries who complete the camp receive interest-free start-up funding. Once the business is established, the repaid money becomes the next missionary's start. Your gift does not stop with one person.",
      cta: { label: "See the fund", href: "/fund" },
    },
    mentor: {
      title: "There is a place for you, whatever your business",
      body: "If you have a skill, teach it. If you have run a business, share your management know-how. If you have buyers, open your channels. If you have professional expertise, offer your advice. What you already have is the greatest mission resource.",
      cta: { label: "Join as a mentor", href: "/mentor" },
    },
    partner: {
      title: "\"Can I really run a business?\" You can start with that question",
      body: "It is fine if you have no experience, no idea, or no capital. From finding an idea to your first sale, a seasoned business owner stays beside you. WMTO will do its very best to help you become self-reliant, all the way.",
      cta: { label: "Request a consultation", href: "/apply?type=partner_consult" },
    },
    trust: {
      title: "So you can join with confidence",
      items: [
        {
          name: "Governance",
          text: "Led by a committee of Christian business owners and built together with IM Mission",
        },
        {
          name: "Training base",
          text: "The mission base in the Philippines, with lodging and classrooms",
          photo: true,
        },
        {
          name: "Finances",
          text: "We openly publish how every gift and every Pass-It-On Fund is used",
        },
      ],
      board: "Steering committee",
      boardPlaceholder: "Committee introductions are coming soon",
    },
    faq: {
      title: "Frequently asked questions",
      items: [
        {
          q: "Can my line of business take part?",
          a: "Yes. Beyond teaching a skill, you can join through management coaching, opening sales channels, or expert advice, whatever your industry.",
        },
        {
          q: "Will it take a lot of my time?",
          a: "A 60-minute online meeting every two weeks is the baseline. Take part in the camp and mentoring as much as you are able.",
        },
        {
          q: "What happens if a missionary's business fails?",
          a: "The mentor walks with them to the end, and in unavoidable cases the repayment of the fund can be waived after reviewing the circumstances.",
        },
        {
          q: "Where does the money I give go?",
          a: "It covers missionaries' camp fees and airfare and the start-up Pass-It-On Fund, and how it is used is reported regularly.",
        },
        {
          q: "Do missionaries have to pay?",
          a: "They cover only a part within what is manageable, and the rest is supported by sponsors.",
        },
      ],
    },
    final: {
      title: "We are looking for people to start\nthe first Philippines training camp with us",
      body: "Come and see first. You can observe a biweekly online meeting with no commitment.",
      buttons: [
        { label: "Observe an online meeting", href: "/apply?type=observe" },
        { label: "Request a consultation", href: "/apply?type=partner_consult" },
        { label: "Give", href: "/sponsor" },
      ],
    },
  },

  about: {
    top: { title: "More Blessed to Give", sub: "It is more blessed to give than to receive. Acts 20:35" },
    who: {
      title: "A self-sustaining mission network built by Christian business owners",
      body: "WMTO (Work Mission Tentmaking Organization) is a community of Christian business owners, missionaries, and sponsors who gather to pass the business wisdom and experience God gave them on to the mission field.",
    },
    vision: {
      title: "A mission where every missionary stands on their own",
      body: "We dream of a future where missionaries' ministries are not shaken by the size of their support, where they stand on their own in the field and share the gospel for the long term.",
    },
    mission: {
      title: "To learn, to start, and to stand on their own",
      items: [
        "Pass the skills and experience of Christian business owners on to missionaries",
        "Prepare businesses that fit the field through the Philippines training camp",
        "Help them begin with the Pass-It-On Fund and walk with them to the end through mentoring",
        "Create a cycle in which self-reliant missionaries raise up the next ones",
      ],
    },
    different: {
      title: "We gather to give, not to get",
      body: "Many business networks gather to get more. WMTO gathers to share what we have already received. Yet the one who gives is blessed too: trust among like-minded business owners, the joy of seeing the fruit of mission with your own eyes, and a new way of seeing your business as a calling.",
    },
    values: {
      title: "Core values",
      items: [
        { name: "Give", text: "Give freely what you have" },
        { name: "Walk With", text: "Teach and walk with them to the end" },
        { name: "Pass It On", text: "Pass the grace you received on to the next person" },
        { name: "Transparency", text: "Share every finance and every fruit openly" },
      ],
    },
    three: {
      title: "Three kinds of people, together",
      items: [
        { name: "Business owners (Mentor)", text: "Christian business owners who share their experience" },
        { name: "Missionaries (Partner)", text: "Missionaries walking toward self-reliance" },
        { name: "Sponsors (Sponsor)", text: "Sponsors who open the way" },
      ],
    },
    ops: {
      title: "How we are run",
      body: "WMTO is led by a committee of Christian business owners and built together with IM Mission. We began in Korea and are expanding chapters to the Americas and Asia.",
    },
    final: {
      title: "Will you join this vision?",
      buttons: [
        { label: "I want to teach", href: "/mentor" },
        { label: "I want to give", href: "/sponsor" },
        { label: "I want to begin standing on my own", href: "/partner" },
      ],
    },
  },

  mentor: {
    top: {
      title: "Your experience\nbecomes a missionary's tomorrow",
      sub: "The road you have walked as a Christian business owner is itself what the mission field needs most.",
    },
    why: {
      title: "The mission field needs more than sermons",
      body: "How to set a price, how to bring in customers, how to keep the books. What feels obvious to you is a missionary's first step toward self-reliance. If decades of trial and error can be shared in a few hours of teaching, it is a gift that lasts longer than any donation.",
    },
    ways: {
      title: "There is a place for you, whatever your business",
      sub: "You do not need a skill to teach. The experience of having run a business is itself what is needed.",
      items: [
        {
          name: "Teach a skill",
          en: "Skill Mentor",
          text: "Teach skills that can be started right away in the field: beauty, cooking and baking, coffee, crafts, photo and video, website building, and more. You serve as an instructor at the Philippines camp.",
        },
        {
          name: "Business coaching",
          en: "Business Coach",
          text: "Accounting, pricing, marketing, customer and staff management, business planning. Anyone who has run a business can do this, in any industry.",
        },
        {
          name: "Open a channel",
          en: "Channel Partner",
          text: "Buy, distribute, and introduce buyers to the coffee and handicrafts made in the field. It helps more than any lecture.",
        },
        {
          name: "Expert advice",
          en: "Advisor",
          text: "Help through consultation when expertise is needed in law, tax, trade, medicine, and more.",
        },
      ],
      closing:
        "When you join, choose the ways you want to help and we will connect you with the right missionary.",
    },
    how: {
      title: "Join in a way that fits your time",
      items: [
        { name: "Online meeting every two weeks (60 min)", text: "Field reports and lectures" },
        { name: "Offline meeting once a month", text: "Fellowship and hands-on practice among business owners" },
        { name: "1:1 mentoring (once a month)", text: "Walk with one missionary" },
        {
          name: "Philippines training camp (1 to 2 weeks)",
          text: "Skill Mentors and Business Coaches go in person to teach, a skills-based mission",
        },
        { name: "Global conference once a year", text: "" },
      ],
    },
    gain: {
      title: "The blessing of giving",
      items: [
        "A network of trust with like-minded Christian business owners",
        "The joy of seeing your experience bear fruit in a family's self-reliance",
        "New business opportunities connected to the mission field",
        "A new way of seeing your business as a calling",
      ],
    },
    stages: {
      title: "From seed to fruit",
      items: [
        { name: "Seed", text: "Begin with orientation" },
        { name: "Sower", text: "Become a mentor to one missionary" },
        { name: "Harvester", text: "Be part of a missionary's self-reliance" },
        { name: "Elder", text: "Lead a chapter and raise up the next mentors" },
      ],
    },
    fee: {
      title: "Fees",
      labels: ["Fees", "Pass-It-On Fund"],
      lines: ["Joining fee KRW 200,000, annual fee KRW 700,000", "30% of fees go toward the missionaries' start-up Pass-It-On Fund"],
    },
    final: {
      title: "Come and see first",
      body: "Before you join, observe one online meeting. Just listen to the missionaries' stories for yourself.",
      buttons: [
        { label: "Observe an online meeting", href: "/apply?type=observe" },
        { label: "Ask about joining as a mentor", href: "/apply?type=mentor_join" },
        { label: "Talk about how I can take part", href: "/apply?type=mentor_join" },
      ],
    },
  },

  partner: {
    top: {
      title: "You no longer have to\ncarry this alone",
      sub: "On the road to a self-sustaining mission, WMTO will walk with you from start to finish.",
    },
    empathy: {
      title: "\"Can I really run a business?\"",
      body: "Many missionaries ask the same question. You have never learned business, and you fear that if it fails, your ministry will be shaken too. We understand. That is why WMTO exists.",
    },
    assure: {
      title: "Anyone can do it, because you do not do it alone",
      items: [
        { name: "No experience? That is fine", text: "We teach from the basics" },
        { name: "No idea yet? That is fine", text: "We find one together" },
        { name: "No capital? That is fine", text: "There is the Pass-It-On Fund" },
        { name: "Stuck? Someone is there to ask", text: "A dedicated mentor walks with you" },
      ],
    },
    stages: {
      title: "One step at a time, without pressure",
      items: [
        { name: "Ready", text: "Find and prepare a business that fits you (Academy is free)", detail: "At first you do not need an idea or a plan. You learn the basics of business slowly through the Academy videos.", points: ["The online Academy courses are free", "We help you find a business idea that fits you", "You meet business owners at the biweekly online meetings"] },
        { name: "Launch", text: "Learn at the Philippines camp and start your business (a mentor is assigned; you may apply for the Pass-It-On Fund)", detail: "After the three-week camp, a mentor is assigned, and your business plan is reviewed so you can apply for start-up funds.", points: ["Three weeks at the Philippines camp: foundations, a specialty track, and your finished plan", "A mentor is assigned and walks with you to the end", "Apply for KRW 1 to 5 million from the Pass-It-On Fund (interest-free, after review)"] },
        { name: "Growing", text: "The first sales arrive and the business grows (second-stage support, sales channels)", detail: "Once the first sales come in, we help the business grow one step further.", points: ["Second-stage support helps you expand", "We connect you to sales channels where you meet markets and customers", "After the grace period, you repay a small share of sales (5 to 10%)"] },
        { name: "Self-Sustaining", text: "You reach self-reliance and become a mentor to the next missionary", detail: "Business income now sustains the ministry. Now you pass the help you received to the next person.", points: ["Business income keeps the ministry going", "You join as a mentor to the next missionary", "The repaid fund becomes the next missionary's start"] },
      ],
    },
    camp: {
      title: "Learn in the Philippines, start in the mission field",
      body: "Christian business owners come in person to teach. You learn skills you can use in the field right away, intensively: business basics, marketing, blog and website building, beauty, cooking, and more.",
    },
    cost: {
      title: "Minimal burden, shared responsibility",
      items: [
        { name: "Annual fee", text: "KRW 100,000 (a sponsor can pay it for you)" },
        { name: "Your share of the camp", text: "KRW 250,000 to 400,000. The rest of airfare, lodging, and meals is supported by sponsors" },
        { name: "Start-up funding", text: "Pass-It-On Fund of KRW 1 to 5 million, interest-free (6 to 12 months' grace, repaid according to sales)" },
      ],
      note: "If the business becomes difficult, repayment can be waived after reviewing your circumstances",
    },
    promise: {
      title: "WMTO's promise",
      body: "A missionary's self-reliance is the continuation of the mission. We will do our very best to help you until you stand on your own, and until you raise up another missionary.",
    },
    final: {
      title: "Start with a conversation",
      body: "You do not need to have decided anything yet. Sharing where you are now is the first step.",
      buttons: [
        { label: "Request a consultation", href: "/apply?type=partner_consult" },
        { label: "Observe a meeting", href: "/apply?type=observe" },
      ],
    },
  },

  sponsor: {
    top: {
      title: "Your gift\ndoes not stop with one person",
      sub: "A missionary stands up, and that missionary raises up another. Please join us at the beginning.",
    },
    why: {
      title: "We support the strength to stand, not living expenses",
      body: "Traditional support protects a missionary's today. WMTO support builds a missionary's tomorrow. Support that helps people learn, start, and become self-reliant bears more fruit as time goes on.",
    },
    ways: {
      title: "Join in the way that speaks to you",
      items: [
        { name: "1:1 missionary support", text: "Cover one missionary's camp fee and airfare (about KRW 1.5 to 2.5 million per person)" },
        { name: "Camp scholarship", text: "Help with the running of the entire Philippines training camp (any amount)" },
        { name: "Pass-It-On Fund", text: "It becomes a graduating missionary's start-up funding and, once repaid, flows on to the next missionary" },
        { name: "Monthly giving", text: "Stay with us steadily, from KRW 10,000 a month" },
      ],
    },
    cycle: {
      title: "One gift, fruit that keeps coming",
      body: "When a missionary who started a business with the Pass-It-On Fund becomes self-reliant, the repayment becomes the next missionary's start. Your gift of KRW 1 million flows three, four times and builds up many mission fields.",
    },
    report: {
      title: "You can see the fruit of your gift yourself",
      items: [
        "We regularly send news of the training, start-up, and self-reliance of the missionary you support",
        "We openly publish how funds are used",
        "You are invited to the annual conference, and may also visit the camp in the Philippines if you wish",
      ],
    },
    church: {
      title: "A church goes further together",
      body: "A church's mission team can recommend its own missionaries to the WMTO program and support them. Watch the missionaries you sent out become self-reliant.",
    },
    final: {
      title: "Today, become the start\nof one missionary's journey",
      buttons: [
        { label: "Give", href: "/apply?type=sponsor_inquiry" },
        { label: "Ask about giving", href: "/apply?type=sponsor_inquiry" },
      ],
    },
  },

  camp: {
    top: {
      title: "Learn in the Philippines,\nstart in the mission field",
      sub: "An intensive training camp for a self-sustaining mission, taught in person by working Christian business owners",
    },
    intro: {
      title: "A time to learn, to practice, and to gain fellow workers",
      body: "The WMTO training camp is held at the mission base in the Philippines. Missionaries learn skills they can use in the field right away, meet the mentors who will walk with them, and go home with their own completed business plan.",
    },
    overview: {
      title: "Camp overview",
      items: [
        { name: "Place", text: "The mission base in the Philippines (lodging and classrooms provided)" },
        { name: "Schedule", text: "Twice a year (first half and second half)" },
        { name: "Length", text: "A three-week intensive course" },
        { name: "For", text: "Missionaries preparing for a self-sustaining mission (Ready and Launch stages)" },
      ],
    },
    weeks: {
      title: "The three weeks (sample)",
      items: [
        { name: "Week 1: Foundations", text: "The vision of a self-sustaining mission and the basics of business (pricing, accounting, customers)", detail: "So that even first-time business owners can follow, we start together with the most basic things.", points: ["The vision of self-sustaining mission and the mindset for business", "How to set prices and keep track of money", "How to meet customers and talk with them"] },
        { name: "Week 2: Specialist track", text: "Intensive practice in the field you chose", detail: "You choose the track that fits the business you plan to run on the field, and learn by hand with a working business owner as your instructor.", points: ["Choose from business, marketing, digital, or a skill track (beauty, cooking and baking, coffee, and more)", "Your instructor watches right beside you and corrects on the spot", "Focus on skills you can actually use on the field"] },
        { name: "Week 3: Getting ready to start", text: "Complete your business plan, present it to your mentor for feedback, and apply for the Pass-It-On Fund", detail: "At the end of the three weeks you explain your own business, and return to the field ready to start.", points: ["Complete your business plan", "Present to your mentor and receive feedback", "Apply for the Pass-It-On Fund and be connected with your mentor"] },
      ],
    },
    tracks: {
      title: "Skills you can use in the field right away",
      items: [
        { name: "Business", text: "Business planning, accounting, pricing, small-scale start-ups" },
        { name: "Marketing", text: "Social media promotion, online sales, building a brand" },
        { name: "Digital", text: "Building blogs and websites, editing photos and video" },
        { name: "Skills", text: "Beauty, cooking and baking, coffee, and more (expanding with our instructors)" },
      ],
    },
    teachers: {
      title: "Taught by business owners proven in the field",
      body: "Every instructor is a WMTO Skill Mentor or Business Coach. Christian business owners who have built real businesses come for one to two weeks at their own expense to share their experience. They continue as your mentors after the camp ends.",
    },
    cost: {
      title: "Cost",
      items: [
        { name: "Your share", text: "KRW 250,000 to 400,000" },
        { name: "The rest of airfare, lodging, and meals", text: "Supported by sponsors" },
      ],
    },
    after: {
      title: "The camp is not the end, it is the beginning",
      items: [
        "A 1:1 mentor is assigned, with monthly online mentoring",
        "Eligibility to apply for the Pass-It-On Fund (KRW 1 to 5 million, interest-free)",
        "Stay connected with fellow missionaries through the biweekly online meeting",
      ],
    },
    support: {
      partner: { who: "Missionaries", label: "Apply for the camp", href: "/apply?type=camp_apply" },
      mentor: {
        who: "Business owners",
        text: "Serve the mission field for one to two weeks with your skills",
        label: "Apply to teach",
        href: "/apply?type=camp_instructor",
      },
    },
  },

  fund: {
    top: { title: "Pass the grace\nyou received to the next missionary" },
    body: "The Pass-It-On Fund is an interest-free fund that helps missionaries who complete the camp start a business. Once the business is established, the repaid money becomes the next missionary's start.",
    termsTitle: "Terms",
    terms: [
      { name: "Amount", text: "KRW 1 to 5 million for the first loan" },
      { name: "Interest", text: "None" },
      { name: "Grace period", text: "6 to 12 months" },
      { name: "Repayment", text: "5 to 10% of sales, over 2 to 3 years" },
      { name: "Support", text: "Your mentor walks with you" },
    ],
    safetyTitle: "Safeguards",
    safety: [
      "If the business fails, repayment can be waived after reviewing the circumstances",
      "With a repayment record, you can apply for a second round of support",
    ],
    status: {
      title: "The flow so far",
      text: "Missionaries started through this fund: ○  ·  Funds that have flowed on so far: KRW ○",
      note: "Real figures will be connected later",
    },
    cta: { label: "Give to the Pass-It-On Fund", href: "/apply?type=sponsor_inquiry" },
  },

  stories: {
    title: "Stories of fruit",
    empty: "There are no stories yet. We will share the first story of fruit soon.",
    observeCta: "Observe an online meeting",
    finalTitle: "Be the next story",
    finalBody: "Join as a business owner, a missionary, or a sponsor.",
    finalButtons: [
      { label: "Join as a mentor", href: "/mentor" },
      { label: "Request a consultation", href: "/apply?type=partner_consult" },
    ],
    emptyTitle: "We are preparing our first stories of fruit",
    emptyBody: "When real stories come in, we will share them here. Until then, come hear the missionaries' stories yourself at a biweekly online meeting.",
    example: "Example",
  },

  events: {
    title: "Gathering together",
    empty: "There are no individual events listed right now. Please see our regular gatherings below.",
    observe: "Observe",
    zoom: "Zoom link",
    finalTitle: "Come and see first",
    finalBody: "You can observe a biweekly online meeting with no commitment.",
    finalButtons: [
      { label: "Observe an online meeting", href: "/apply?type=observe" },
      { label: "Contact us", href: "/apply?type=contact" },
    ],
    regularTitle: "Regular gatherings",
    regular: [
      { name: "Online meeting every two weeks", text: "60 minutes: a 60-second self-introduction, a missionary's field report, and a business owner's lecture." },
      { name: "Offline meeting once a month", text: "Meet by chapter for fellowship and a hands-on workshop." },
      { name: "Philippines training camp", text: "Twice a year, a three-week intensive course. Prepare a business that fits the field." },
      { name: "Global conference", text: "Once a year. We gather in one place across chapters and countries." },
    ],
    types: {
      online: "Online meeting",
      offline: "Offline meeting",
      camp: "Camp",
      conference: "Conference",
    },
  },

  apply: {
    title: "Apply or contact us",
    sub: "Leave your details and we will get back to you after reviewing.",
    typeLabel: "Type of inquiry",
    types: {
      observe: { title: "Observe an online meeting", name: "Observe a meeting" },
      mentor_join: { title: "Ask about joining as a mentor", name: "Join as a mentor" },
      partner_consult: { title: "Request a consultation", name: "Consultation" },
      camp_apply: { title: "Apply for the camp", name: "Camp application" },
      camp_instructor: { title: "Apply to teach at the camp", name: "Camp instructor" },
      sponsor_inquiry: { title: "Ask about giving", name: "Giving" },
      contact: { title: "General inquiry", name: "General inquiry" },
    },
    fields: {
      name: "Name",
      email: "Email",
      phone: "Phone",
      country: "Country of residence",
      message: "Message",
      role: "Role",
      preferredSchedule: "Preferred schedule",
      businessName: "Company name",
      industry: "Industry",
      contributionTypes: "Ways you can contribute (select all that apply)",
      missionField: "Country and region of ministry",
      sendingOrg: "Sending organization",
      businessIdea: "Business you are considering (optional)",
      track: "Preferred track",
      teachableFields: "Areas you can teach",
      availability: "Period you can join",
      sponsorType: "Type of sponsor",
      churchName: "Church name",
      interestedKinds: "Ways of giving you are interested in (select all that apply)",
    },
    options: {
      role: { mentor: "Business owner", partner: "Missionary", sponsor: "Sponsor" },
      contribution: {
        skill: "Teach a skill",
        coach: "Business coaching",
        channel: "Open a channel",
        advisor: "Expert advice",
      },
      sponsorType: { individual: "Individual", church: "Church" },
      sponsorKind: {
        one_to_one: "1:1 missionary support",
        camp: "Camp scholarship",
        fund: "Pass-It-On Fund",
        monthly: "Monthly giving",
      },
      track: {
        business: "Business",
        marketing: "Marketing",
        digital: "Digital",
        skill: "Skills",
      },
    },
    consent: "I agree to the collection and use of my personal information (required)",
    consentHelp:
      "Data collected: name, email, phone, country of residence, and what you enter / Purpose: receiving your application and replying / Retention: until the purpose is fulfilled",
    select: "Select",
    errorTitle: "We could not send it",
    submit: "Send",
    submitting: "Sending…",
    thanks: {
      title: "Thank you",
      body: "Your application has been received. We will reply to the email address you entered after reviewing it.",
      back: "Back to home",
    },
    errors: {
      generic: "Something went wrong while sending. Please try again in a moment.",
      required: "Please check the required fields.",
      email: "Please check the format of your email address.",
      consent: "Please agree to the collection and use of your personal information.",
    },
  },

  // The admin area is for the Korean operating staff and stays in Korean.
  admin: ko.admin,

  connect: {
    appName: "WMTO Connect",
    nav: { home: "Home", events: "Events", mentoring: "Mentoring", report: "Reports", more: "More", profile: "Profile" },
    login: {
      title: "Log in",
      sub: "We will send a login link to your approved email address.",
      email: "Email",
      send: "Get a login link",
      sent: "Please check your email. If the address is registered, a login link is on its way.",
      invalidLink: "The link has expired or is not valid. Please request a new one.",
      inactive: "This account is not active yet. You can use the app once it is approved.",
      notMember: "Apply on the website first. Once you are approved, you can use the app.",
      apply: "Apply to observe or join",
    },
    greeting: ", welcome",
    stageTitle: "My growth stage",
    stageNames: {
      seed: "Seed", sower: "Sower", harvester: "Harvester", elder: "Elder",
      ready: "Ready", launch: "Launch", growing: "Growing", self_sustaining: "Self-Sustaining",
    },
    stageDesc: {
      seed: "Begin with orientation", sower: "Become a mentor to one missionary",
      harvester: "Be part of a missionary's self-reliance", elder: "Lead a chapter and raise up the next mentors",
      ready: "Find and prepare a business that fits you", launch: "Learn at the camp and start your business",
      growing: "The first sales arrive and the business grows", self_sustaining: "Reach self-reliance and become a mentor to the next missionary",
    },
    contribution: { skill: "Teach a skill", coach: "Business coaching", channel: "Open a channel", advisor: "Expert advice" },
    myMentor: "My mentor",
    noMentor: "No mentor has been assigned yet. We will connect you soon.",
    myMentees: "My missionaries",
    noMentees: "No missionary has been assigned yet. The steering committee will connect you soon.",
    lastMentoring: "Last mentoring",
    noMentoringYet: "No record",
    latestReport: "Latest self-reliance report",
    noReportYet: "None yet",
    nextEvent: "Next meeting",
    noEvent: "There are no upcoming meetings.",
    join: "Join",
    reportDue: "Please write this month's self-reliance report",
    reportDone: "This month's self-reliance report is submitted",
    writeReport: "Write a report",
    sponsorHome: "News and records of your giving will be available in a later phase. Meanwhile you can see meeting times in the Events tab.",
    events: {
      title: "Meetings",
      empty: "There are no upcoming meetings.",
      checkIn: "Check in",
      checkedIn: "Checked in",
      checkInHint: "Check-in opens 30 minutes before the start.",
      past: "Past meetings",
    },
    mentoring: {
      title: "Mentoring log",
      empty: "No records yet.",
      newTitle: "Write a new record",
      matching: "Missionary",
      heldAt: "Date and time (Korea time)",
      duration: "Duration (minutes)",
      content: "What you shared",
      nextSteps: "What to do next (optional)",
      prayer: "Prayer requests (optional)",
      save: "Save record",
      withMentor: "Mentor",
      minutes: "min",
      noMatching: "You need an assigned missionary before you can write a record.",
    },
    report: {
      title: "Self-reliance report",
      monthTitle: "Monthly report",
      month: "Month",
      revenue: "This month's revenue",
      currency: "Currency",
      selfReliance: "Self-reliance (1 very low to 5 very high)",
      difficulties: "Difficulties",
      prayer: "Prayer requests",
      save: "Save",
      saved: "Saved.",
      history: "Past reports",
      empty: "No reports have been submitted yet.",
      menteeReports: "Reports from my missionaries",
      revenueLabel: "Revenue",
      reliance: "Self-reliance",
    },
    profile: {
      title: "Profile",
      save: "Save",
      saved: "Saved.",
      role: "Role",
      stage: "Growth stage",
      logout: "Log out",
      language: "Language",
      install: "Add this app to your home screen to use it like an app.",
    },
    more: {
      title: "More",
      items: {
        matching: { name: "Request a mentor", text: "Ask a business owner in the area you need for help" },
        requests: { name: "Matching requests", text: "See the missionaries who need you" },
        referrals: { name: "Referrals", text: "Introduce customers to other business owners and see the introductions you received" },
        thanks: { name: "Thank-you letters", text: "Send your thanks and read the letters you received" },
        academy: { name: "Academy", text: "A library of lecture videos" },
        growth: { name: "Activity and growth", text: "This month's giving and your stage history" },
        profile: { name: "Profile", text: "Edit your contact details and profile" },
      },
    },
    growth: {
      title: "Activity and growth",
      thisMonth: "Giving this month",
      note: "The score is not a ranking. It is a way to look back on the road you have walked.",
      scoreLabel: "Activity score",
      labels: {
        attendance: "Meeting attendance", mentoring: "Mentoring", reports: "Self-reliance reports",
        referrals: "Referrals sent", letters: "Thank-you letters", matchings: "Active partnerships",
      },
      history: "Stage history",
      noHistory: "No stage changes yet.",
      suggestion: "You meet the criteria for the next stage",
      suggestionNote: "It takes effect after the steering committee approves it.",
    },
    request: {
      title: "Request a mentor",
      new: "Area where you need help",
      message: "What kind of help do you need?",
      send: "Send request",
      mine: "My requests",
      empty: "You have not sent any requests yet.",
      status: { pending: "Waiting", accepted: "Matched", cancelled: "Cancelled" },
      cancel: "Cancel",
      incomingTitle: "Matching requests",
      incomingEmpty: "There are no requests you can take on right now. You only see requests that match the ways of contributing in your profile.",
      accept: "I will take it",
      acceptHint: "If you accept, you are matched with this missionary and can write mentoring records.",
    },
    referral: {
      title: "Referrals",
      new: "Introduce a customer",
      receiver: "Business owner to receive it",
      client: "Customer or company you are introducing",
      contact: "Contact (optional)",
      note: "About the introduction",
      send: "Send introduction",
      received: "Introductions received",
      sent: "Introductions sent",
      empty: "No introductions yet.",
      noMentors: "There are no other business owners to send an introduction to yet.",
      status: { sent: "Delivered", contacted: "Contacted", closed: "Closed" },
      update: "Update status",
      from: "From",
      to: "To",
    },
    thanks: {
      title: "Thank-you letters",
      write: "Write a letter",
      to: "Mentor to receive it",
      body: "What you want to say",
      send: "Send letter",
      sent: "Letters sent",
      received: "Letters received",
      empty: "No letters yet.",
      noMentor: "You can write a thank-you letter once a mentor is assigned.",
      newBadge: "New",
    },
    academy: {
      title: "Academy",
      empty: "No lectures have been added yet.",
      watch: "Watch",
      uncategorized: "Other",
    },
    today: {
      title: "Today",
      report: "You have not written this month's self-reliance report yet", reportCta: "Write the report",
      event: "A meeting is about to begin", eventCta: "See the meeting",
      requests: "A matching request is waiting for your help", requestsCta: "See requests",
      unread: "You have an unread thank-you letter", unreadCta: "Read the letter",
      mentoring: "One of your companions has no mentoring log for over a month", mentoringCta: "Add a log",
      thanks: "Tell someone in one line how they helped you", thanksCta: "Write a thank-you letter",
      rest: "Nothing needs your attention today. Have a peaceful day.",
    },
    pending: { requests: "New matching requests", unread: "Unread thank-you letters", requestsLine: "{n} new matching request(s)", unreadLine: "{n} unread thank-you letter(s)" },
    select: "Select",
    emailError: "Please check your email address.",
    errors: { generic: "Something went wrong while saving. Please try again." },
  },

  photo: {
    placeholder: "Photo placeholder",
  },
};
