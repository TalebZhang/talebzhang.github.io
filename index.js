const articles = [
  {
    class: "englishlearning",
    hidden: false,
    title: "我在干什么？",
    href: "now",
    time: null,
    duration: null,
    tag: null,
  },
  {
    class: "beautifulsongs",
    hidden: true,
    title: "音乐播放器",
    href: "./mysongs",
    time: "Feb 5",
    duration: "3min read",
    tag: "Beautiful Songs",
  },
  {
    class: "englishreading",
    hidden: false,
    title: "勤奋>选择:驳斥目光短浅的投机主义者",
    href: "pagra1",
    time: "Nov 6",
    duration: "30min read",
    tag: "Thoughts",
  },
  {
    class: "englishreading",
    hidden: false,
    title: "为什么我们就是不相信自己可以学好英语？",
    href: "pagra6",
    time: "July 17, 2025",
    duration: "10min read",
    tag: "English learning",
  },
  {
    class: "englishreading",
    hidden: false,
    title: "学英语有什么用？",
    href: "englishuseful",
    time: "July 17, 2025",
    duration: "10min read",
    tag: "English learning",
  },
  {
    class: "englishreading",
    hidden: false,
    title: "我为什么决定停用支付宝？",
    href: "noalipay",
    time: "July 17, 2025",
    duration: "10min read",
    tag: "My Life",
  },
  {
    class: "englishreading",
    hidden: false,
    title: "克制反问，是一种更深层次的掌控力",
    href: "dontyougetit",
    time: "July 17, 2025",
    duration: "10min read",
    tag: "My Life",
  },
  {
    class: "englishreading",
    hidden: false,
    title: "被微信劫持的中国人：一场你从未察觉的数字战争(1)",
    href: "lifewithoutwechat",
    time: "July 17, 2025",
    duration: "13min read",
    tag: "My Life",
  },
  {
    class: "englishreading",
    hidden: false,
    title: "被微信劫持的中国人：一场你从未察觉的数字战争(2)",
    href: "lifewithoutwechat1",
    time: "July 18, 2025",
    duration: "15min read",
    tag: "My Life",
  },
  {
    class: "englishreading",
    hidden: false,
    title: "教育的迷思：为什么成绩优秀的学生，步入社会后的成就普遍低于预期？",
    href: "education",
    time: "July 18, 2025",
    duration: "12min read",
    tag: "Education",
  },
  {
    class: "jpread",
    hidden: true,
    title: "学問のすすめ",
    href: "./qxpone",
    time: "Feb 2",
    duration: "3min read",
    tag: "Japanese Learning",
  },
  {
    class: "jpread",
    hidden: true,
    title: "日剧学习的分级推荐",
    href: "./pagra3",
    time: "Feb 2",
    duration: "3min read",
    tag: "Japanese Learning",
  },
  {
    class: "englishlearning",
    hidden: true,
    title: "美剧学习的分级推荐",
    href: "pagra4",
    time: "Feb 14",
    duration: "5min read",
    tag: "English Learning",
  }
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



// below are catagory function
function showSections(visibleClasses) {
  const allSections = [
    ".englishlearning",
    ".myreading",
    ".jpread",
    ".beautifulsongs",
    ".englishreading",
    ".myexperience",
    ".healthadvice"
  ];

  allSections.forEach(section => {
    document.querySelectorAll(section).forEach(el => {
      el.style.display = visibleClasses.includes(section) ? "block" : "none";
    });
  });
}

document.getElementById("myBtn").addEventListener("click", () => showSections([".englishlearning"]));
document.getElementById("myBtn1").addEventListener("click", () => showSections([".jpread"]));
document.getElementById("myBtn2").addEventListener("click", () => showSections([]));
document.getElementById("myBtn3").addEventListener("click", () => showSections([".myexperience"]));
document.getElementById("myBtn4").addEventListener("click", () => showSections([".myreading"]));
document.getElementById("myBtn5").addEventListener("click", () => showSections([]));
document.getElementById("myBtn6").addEventListener("click", () => showSections([]));
document.getElementById("myBtn7").addEventListener("click", () => showSections([]));
document.getElementById("myBtn8").addEventListener("click", () => showSections([]));
document.getElementById("myBtn9").addEventListener("click", () => showSections([".beautifulsongs"]));
document.getElementById("english").addEventListener("click", () => showSections([".englishreading"]));
document.getElementById("chinese").addEventListener("click", () => showSections([".englishlearning", ".myreading", ".myexperience", ".healthadvice"]));
