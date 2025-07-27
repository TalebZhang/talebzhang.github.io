const articles = [
  {
    class: "englishlearning",
    hidden: false,
    title: "What I am doing now？",
    href: "now",
    time: null,
    duration: null,
    tag: null,
  },
  {
    class: "englishreading",
    hidden: false,
    title: "Hard Work > Choices: Why hustle culture and short-sighted opportunism miss the point.",
    href: "pagra1",
    time: "Nov 6, 2024",
    duration: null,
    tag: "Thoughts",
  },
  {
    class: "englishreading",
    hidden: false,
    title: "Why is it so hard for us to believe we can master a new language?",
    href: "pagra6",
    time: "July 17, 2025",
    duration: null,
    tag: "English learning",
  },
  {
    class: "englishreading",
    hidden: false,
    title: "Why should we learn English?",
    href: "englishuseful",
    time: "July 17, 2025",
    duration: null,
    tag: "English learning",
  },
  {
    class: "englishreading",
    hidden: false,
    title: "The reasons behind my decision to stop using Alipay.",
    href: "noalipay",
    time: "July 17, 2025",
    duration:null,
    tag: "My Life",
  },
  {
    class: "englishreading",
    hidden: false,
    title: "True mastery lies in the restraint not to respond with a rhetorical question.",
    href: "dontyougetit",
    time: "July 17, 2025",
    duration:null,
    tag: "My Life",
  },
  {
    class: "englishreading",
    hidden: false,
    title: "China’s WeChat Captive: The Invisible Digital War You Never Saw Coming(1)",
    href: "lifewithoutwechat",
    time: "July 17, 2025",
    duration:null,
    tag: "My Life",
  },
  {
    class: "englishreading",
    hidden: false,
    title: "China’s WeChat Captive: The Invisible Digital War You Never Saw Coming(2)",
    href: "lifewithoutwechat1",
    time: "July 18, 2025",
    duration:null,
    tag: "My Life",
  },
  {
    class: "englishreading",
    hidden: false,
    title: "The Education Paradox: Why Do Top Students Often Underperform in the Real World?",
    href: "education",
    time: "July 18, 2025",
    duration:null,
    tag: "Education",
  },
   {
    class: "englishreading",
    hidden: false,
    title: "A Cost-Benefit Analysis of Using WeChat",
    href: "wechatornot",
    time: "July 24, 2025",
    duration:null,
    tag: "WechatOrNot",
  },
   {
    class: "englishreading",
    hidden: false,
    title: "The Power of Self-Respect — Reflections on Rockefeller’s Letters",
    href: "selfrespect",
    time: "July 27, 2025",
    duration:null,
    tag: "Self-Respect",
  },
  {
    class: "jpread",
    hidden: true,
    title: "学問のすすめ",
    href: "./qxpone",
    time: "Feb 2",
    duration:null,
    tag: "Japanese Learning",
  },
  {
    class: "jpread",
    hidden: true,
    title: "A Level-Based Guide to Learning Japanese via J-Dramas",
    href: "./pagra3",
    time: "Feb 2",
    duration: null,
    tag: "Japanese Learning",
  },
  {
    class: "englishlearning",
    hidden: true,
    title: "A Level-Based Guide to Learning English with American Dramas",
    href: "pagra4",
    time: "Feb 14",
    duration: null,
    tag: "English Learning",
  },
];

const container = document.getElementById("article-list");

articles.forEach(article => {
  const wrapper = document.createElement("div");
  wrapper.className = `${article.class}${article.hidden ? " hidden" : ""}`;

  wrapper.innerHTML = `
    <div class="title1">
      <a href="${article.href}">${article.title}</a>
    </div>
    ${article.time && article.duration && article.tag ? `
      <span class="time">${article.time}</span> ·
      <span>${article.duration}</span> ·
      <a class="button">${article.tag}</a>
    ` : ""}
  `;
  container.appendChild(wrapper);
});
