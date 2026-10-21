window.WEBTOONS_DATA = [
  {
    id: 'what-is-an-erdos-number',
    episode: 1,
    series: 'Musings:Webtoons',
    title: 'What Is an Erdős Number?',
    date: '2026-10-21',
    tags: ['Mathematics', 'Graph Theory', 'Networks'],
    cover: 'episodes/erdos-number/cover.jpg',
    pdf: 'episodes/1_what_is_an_erdos_number.pdf',
    preview: 'A late-night question becomes a visual walk through Erdős numbers, collaboration networks, and shortest-path distance.',
    panels: Array.from({ length: 9 }, (_, index) => {
      const fileName = String(index + 1).padStart(2, '0');
      return {
        small: `episodes/erdos-number/720/${fileName}.jpg`,
        large: `episodes/erdos-number/1200/${fileName}.jpg`
      };
    }),
    transcript: [
      {
        label: 'Opening',
        text: 'Episode 1 — What Is an Erdős Number?',
        description: 'At night, rain falls outside a library. Ash sits at a desk facing Sage, a glowing AI assistant on a laptop.'
      },
      { label: 'Caption', text: 'Ash had been staring at the same screen for an hour.' },
      { label: 'Caption', text: 'Sage had been waiting.' },
      { label: 'Ash', text: 'What is an Erdős number?' },
      { label: 'Caption', text: 'Two in the morning. Cold coffee. A very tired question.' },
      {
        label: 'Sage',
        text: 'An Erdős number measures how closely a researcher is connected to the mathematician Paul Erdős through co-authored research papers. Erdős himself has a number of 0, his direct co-authors have 1, their co-authors have 2, and so on.',
        description: 'A diagram shows Paul Erdős at the center of an expanding co-authorship network, labeled 0, 1, 2, and 3.'
      },
      { label: 'Ash', text: 'What is it based on?' },
      {
        label: 'Sage',
        text: "It's based on a network of academic collaboration. Each researcher is a node, and a link connects two researchers if they've co-authored a paper. Your Erdős number is the shortest chain of co-authorship links connecting you to Erdős.",
        description: 'A network diagram highlights the shortest path between two researchers.'
      },
      { label: 'Ash', text: 'But what is the foundational concept behind it?' },
      {
        label: 'Sage',
        text: "The foundation is graph theory, specifically shortest-path distance in a network. It demonstrates that distance doesn't have to mean physical space; it can mean the number of relationships separating two entities. The same principle applies to social networks, computer networks, transportation systems, and biological interactions.",
        description: 'Four small networks illustrate social connections, computers, transit, and biology.'
      },
      { label: 'Caption', text: 'Ash stood, and without a word, left the room.' },
      { label: 'Sound', text: 'Shff…' },
      { label: 'Sage', text: '…Would you like to know a fun fact about it?' },
      { label: 'Caption', text: 'Only the rain answered.' },
      { label: 'Closing', text: 'To be continued… Next: Episode 2.' }
    ]
  }
];
