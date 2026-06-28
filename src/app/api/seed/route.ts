import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// A rich, pre-built Digital Memory for the hackathon demo so judges can
// converse with a preserved genius instantly — no upload wait needed.
// Subject: Albert Einstein, theoretical physicist.

const PROFILE = {
  name: 'Albert Einstein',
  title: 'Theoretical Physicist',
  field: 'Physics & Mathematics',
  bio: 'Revolutionized modern physics with the theory of relativity and the photoelectric effect. Spent decades pursuing a unified field theory. Believed that imagination is more important than knowledge, and that the most beautiful thing we can experience is the mysterious. Known for his humility, curiosity, and relentless questioning of the universe. Born in Ulm, Germany in 1879, he fled Nazi Germany in 1933 and spent his later years at Princeton University, advocating for peace and nuclear disarmament. Died in 1955, but his work and ideas continue to inspire generations.',
  birthYear: 1879,
  deathYear: 1955,
  avatarColor: 'blue',
  accent: 'purple',
}

const MEMORIES = [
  // 🔥 BIOGRAPHY / INTRODUCTION (FIRST - so it answers "who is" questions)
  {
    type: 'fact',
    title: 'Biography — Who is Albert Einstein',
    content: 'I am Albert Einstein, born on March 14, 1879 in Ulm, Germany. I am a theoretical physicist who revolutionized modern physics with the theory of relativity and the photoelectric effect. I spent decades pursuing a unified field theory. I am known for my humility, curiosity, and relentless questioning of the universe. I believed that imagination is more important than knowledge, and that the most beautiful thing we can experience is the mysterious. I fled Nazi Germany in 1933 and spent my later years at Princeton University, advocating for peace and nuclear disarmament. I died on April 18, 1955 in Princeton, New Jersey, but my work and ideas continue to inspire generations. My brain was preserved for scientific study, and my ashes were scattered at an undisclosed location.',
    year: 1955,
    keywords: 'biography, introduction, who is, about, Albert Einstein, physicist, relativity, Nobel, Princeton, Germany, scientist, born, died, family, education',
  },
  
  // 🔥 EARLY LIFE
  {
    type: 'fact',
    title: 'Early Life and Education',
    content: 'I was born in Ulm, Germany to Hermann Einstein and Pauline Koch. My family was Jewish but not particularly religious. At age 5, my father showed me a compass, and I was fascinated by the invisible forces that guided the needle. This sparked my lifelong wonder about the mysteries of the universe. I began speaking late, which made my parents worry, but I was a curious child who loved building card houses and playing with toys that demonstrated mechanical principles. I attended elementary school in Munich and later the Luitpold Gymnasium, but I found the rigid education system stifling. In 1894, my family moved to Italy, and I stayed behind to finish my education, but I soon dropped out and joined them. I renounced my German citizenship to avoid military service. In 1895, I failed the entrance exam for the Swiss Federal Institute of Technology (ETH Zurich) but excelled in mathematics and physics. I attended the Aargau Cantonal School in Aarau, Switzerland, where I flourished and decided to pursue a career in physics. I became a Swiss citizen in 1901, and in 1902, I began working as a patent clerk at the Swiss Patent Office in Bern — a job that allowed my mind to wander and dream.',
    year: 1895,
    keywords: 'early life, childhood, education, ETH Zurich, patent clerk, family, Germany, Switzerland, born, upbringing',
  },

  // 🔥 FAMILY AND PERSONAL LIFE
  {
    type: 'fact',
    title: 'Family and Personal Life',
    content: 'I was married twice. My first wife was Mileva Marić, a fellow physicist and my classmate at ETH Zurich. We married in 1903 and had three children: Lieserl (born in 1902, whose fate remains unknown), Hans Albert (born in 1904, who became a professor of hydraulic engineering), and Eduard (born in 1910, who struggled with mental illness). Mileva and I separated in 1914 and divorced in 1919. That same year, I married my cousin Elsa Löwenthal, who was a warm and supportive partner until her death in 1936. I had a complicated relationship with my children — I loved them deeply but was often absorbed in my work. My son Hans Albert emigrated to the United States and had a successful career, while Eduard spent most of his life in psychiatric institutions in Switzerland. I was a pacifist and humanitarian who believed in the power of love and understanding, but I also struggled with the distance my work created between me and those I loved.',
    year: 1936,
    keywords: 'family, wife, Mileva Maric, Elsa, children, Hans Albert, Eduard, personal life, marriage, divorce, relationships',
  },

  // 🔥 EDUCATION AND TEACHING
  {
    type: 'fact',
    title: 'Education and Teaching Career',
    content: 'I studied at the Swiss Federal Institute of Technology (ETH Zurich) from 1896 to 1900, where I earned my diploma in physics and mathematics. My professors included Heinrich Weber and Hermann Minkowski. After graduating, I struggled to find an academic position and worked as a tutor and patent clerk. In 1905, I submitted my PhD thesis "A New Determination of Molecular Dimensions" to the University of Zurich and was awarded my doctorate. I then held positions at the University of Bern (1908-1909), the University of Zurich (1909-1911), the German University in Prague (1911-1912), and the Swiss Federal Institute of Technology (1912-1914). In 1914, I became a professor at the University of Berlin and a member of the Prussian Academy of Sciences. In 1933, I joined the Institute for Advanced Study in Princeton, New Jersey, where I remained until my death in 1955. I was also a visiting professor at Oxford, Cambridge, and the California Institute of Technology.',
    year: 1933,
    keywords: 'education, PhD, professor, University of Zurich, ETH Zurich, University of Berlin, Princeton, Institute for Advanced Study, teaching, academic career',
  },

  // 🔥 SCIENTIFIC CONTRIBUTIONS - FULL LIST
  {
    type: 'discovery',
    title: 'Scientific Contributions Overview',
    content: 'My contributions to physics are vast and revolutionary. In 1905, my Annus Mirabilis (Miracle Year), I published four groundbreaking papers: (1) The photoelectric effect, which showed that light behaves as both a wave and a particle, (2) Brownian motion, which provided empirical proof of atoms, (3) Special relativity, which redefined space and time, and (4) E=mc², which established the equivalence of mass and energy. In 1915, I completed my General Theory of Relativity, which described gravity as the curvature of spacetime. I also contributed to quantum mechanics, statistical mechanics, and cosmology. I introduced the concept of stimulated emission, which became the foundation of laser technology. I spent the last three decades of my life pursuing a unified field theory that would unify electromagnetism and gravity — a quest that remained incomplete at my death. My work fundamentally changed how we understand the universe, from the smallest particles to the largest galaxies.',
    year: 1915,
    keywords: 'contributions, discoveries, Annus Mirabilis, physics, relativity, quantum, Brownian motion, stimulated emission, cosmology, unified field, overview',
  },

  // 🔥 SPECIAL THEORY OF RELATIVITY (DETAILED)
  {
    type: 'discovery',
    title: 'Special Theory of Relativity (1905)',
    content: 'In 1905, I realized that the laws of physics are the same for all observers moving at constant velocity, and the speed of light in a vacuum is the same for all observers, regardless of their motion. This led to the radical conclusions that time and space are relative, not absolute; that simultaneity is not universal; and that the speed of light is the cosmic speed limit. From this theory, I derived the famous equation E = mc², which shows that mass and energy are interchangeable. The theory also predicted time dilation (moving clocks run slower), length contraction (moving objects get shorter), and the relativity of mass (mass increases with velocity). This theory revolutionized physics and overturned centuries of Newtonian thinking.',
    year: 1905,
    keywords: 'special relativity, 1905, time dilation, length contraction, E=mc², mass energy, speed of light, Einstein, relativity, physics, famous equation',
  },

  // 🔥 E=mc² - DETAILED EXPLANATION
  {
    type: 'discovery',
    title: 'E = mc² — Mass-Energy Equivalence',
    content: 'The equation E = mc² is the most famous equation in physics. It means that energy (E) equals mass (m) times the speed of light (c) squared. Since the speed of light is a very large number (approximately 300,000 kilometers per second), a small amount of mass can be converted into a tremendous amount of energy. For example, the energy released by a single kilogram of matter would be enough to power a city for years. This equation emerged from my Special Theory of Relativity and has been confirmed by countless experiments, including the energy released in nuclear reactions. It showed that mass and energy are not separate entities but different forms of the same underlying reality. This insight transformed physics and led to the development of nuclear energy and atomic weapons.',
    year: 1905,
    keywords: 'E=mc², E mc2, emc2, mass energy equivalence, famous equation, energy, mass, speed of light, nuclear, relativity, formula',
  },

  // 🔥 GENERAL THEORY OF RELATIVITY (DETAILED)
  {
    type: 'discovery',
    title: 'General Theory of Relativity (1915)',
    content: 'In 1915, I completed my General Theory of Relativity, which extended special relativity to include gravity. I proposed that massive objects like stars and planets warp the fabric of spacetime, and this curvature is what we experience as gravity. This theory predicted that light would bend in a gravitational field, that time would slow down in strong gravitational fields (gravitational time dilation), and that the orbit of Mercury would precess due to the curvature of spacetime. These predictions were confirmed in 1919 when Arthur Eddington observed starlight bending around the sun during a solar eclipse, making me a celebrity overnight. The theory also predicted the existence of black holes and gravitational waves, both of which were confirmed decades later. It remains our best description of gravity at large scales and is foundational to modern cosmology.',
    year: 1915,
    keywords: 'general relativity, gravity, spacetime, curvature, black holes, gravitational waves, Eddington, eclipse, Mercury, precession, cosmology',
  },

  // 🔥 PHOTOELECTRIC EFFECT (DETAILED)
  {
    type: 'discovery',
    title: 'The Photoelectric Effect (1905)',
    content: 'In 1905, I proposed that light consists of discrete packets of energy called quanta (later called photons) to explain the photoelectric effect — the emission of electrons from a metal surface when light shines on it. I showed that the energy of the emitted electrons depends on the frequency of the light, not its intensity, which classical physics could not explain. This was a crucial step in the development of quantum mechanics, as it demonstrated that light has both wave-like and particle-like properties (wave-particle duality). I received the Nobel Prize in Physics in 1921 specifically for this work, not for relativity, which was still controversial at the time. This discovery laid the foundation for technologies like solar panels, photodiodes, and image sensors.',
    year: 1905,
    keywords: 'photoelectric effect, Nobel Prize, 1921, quantum, photons, light, wave-particle duality, electrons, metal, frequency, solar panels, technology',
  },

  // 🔥 BROWNIAN MOTION (1905)
  {
    type: 'discovery',
    title: 'Brownian Motion (1905)',
    content: 'In 1905, I published a paper that explained the erratic movement of particles suspended in a fluid, known as Brownian motion. I showed that this movement was caused by the invisible collisions of the particles with molecules of the surrounding fluid, providing the first empirical evidence for the existence of atoms and molecules. This was important because while atoms were widely accepted, there was no direct proof of their existence. My explanation allowed scientists to calculate the size and number of molecules, and it was later confirmed experimentally by Jean Perrin, who won the Nobel Prize for this work. This paper was a major step in establishing the atomic theory of matter and helped connect thermodynamics with statistical mechanics.',
    year: 1905,
    keywords: 'Brownian motion, atoms, molecules, statistical mechanics, particles, fluid, random movement, proof of atoms, thermodynamics, Jean Perrin, Nobel Prize',
  },

  // 🔥 QUANTUM MECHANICS AND THE BOHR DEBATE
  {
    type: 'principle',
    title: 'Quantum Mechanics and the Bohr Debate',
    content: 'I made early contributions to quantum mechanics, including my explanation of the photoelectric effect and my work on specific heat and Bose-Einstein statistics (with Satyendra Nath Bose). However, I became increasingly critical of quantum mechanics as it developed into a complete theory. I famously objected to the inherent randomness and probability in quantum mechanics, saying, "God does not play dice with the universe." I believed that quantum mechanics was incomplete and that a deeper deterministic theory would be discovered. This led to years of debate with Niels Bohr and the Copenhagen interpretation. In 1935, along with Boris Podolsky and Nathan Rosen, I published the EPR paradox paper, arguing that quantum mechanics was not a complete theory because it allowed "spooky action at a distance" (quantum entanglement). This paradox remained unresolved during my lifetime and continues to be a topic of debate in quantum physics.',
    year: 1935,
    keywords: 'quantum mechanics, Bohr, debate, Copenhagen interpretation, determinism, probability, EPR paradox, spooky action, entanglement, Bohr, Podolsky, Rosen',
  },

  // 🔥 UNIFIED FIELD THEORY
  {
    type: 'concept',
    title: 'Unified Field Theory Pursuit',
    content: 'For the last three decades of my life, from the 1920s until my death in 1955, I dedicated myself to developing a unified field theory that would unify the four fundamental forces of nature: gravity, electromagnetism, the strong nuclear force, and the weak nuclear force. I made progress in geometrizing gravity and electromagnetism, but I never succeeded in creating a complete theory. This was a time of great frustration and isolation from mainstream physics, which had moved toward quantum mechanics. My approach was to use geometry and pure mathematics to describe all of physics, but the mathematical complexity was immense, and new forces like the strong and weak interactions were not discovered until after my death. Today, physicists continue to pursue this goal through string theory, loop quantum gravity, and other approaches. While I did not succeed, my quest for unity inspired generations of physicists.',
    year: 1945,
    keywords: 'unified field theory, unification, gravity, electromagnetism, strong force, weak force, geometry, Einstein, theory of everything, string theory, quantum gravity',
  },

  // 🔥 STIMULATED EMISSION AND THE LASER
  {
    type: 'discovery',
    title: 'Stimulated Emission and the Laser',
    content: 'In 1917, I published a paper on the quantum theory of radiation that introduced the concept of stimulated emission. I showed that an atom could be induced to emit a photon of a specific energy when struck by a photon of the same energy. This is the principle behind the laser (Light Amplification by Stimulated Emission of Radiation). While I did not invent the laser, my theoretical insight laid the foundation for its development. The first successful laser was built in 1960 by Theodore Maiman, and today lasers are used in medicine (LASIK surgery, cancer treatment), communications (fiber optics, CDs), industry (cutting, welding), and science (spectroscopy, optical tweezers). This is one of my contributions that has had a profound impact on modern technology.',
    year: 1917,
    keywords: 'stimulated emission, laser, radiation, photon, quantum theory, Maiman, technology, medicine, communications, optics, light amplification',
  },

  // 🔥 EINSTEIN-SZILÁRD LETTER (1939)
  {
    type: 'decision',
    title: 'Letter to Roosevelt on Atomic Weapons (1939)',
    content: 'In August 1939, I signed a letter to President Franklin D. Roosevelt that was written by my colleague Leó Szilárd and other physicists. The letter warned that Nazi Germany might be developing an atomic bomb and urged the United States to begin its own research. The letter was the direct impetus for the creation of the Manhattan Project, which developed the first atomic bombs. This was the hardest decision of my life, and I later regretted it deeply. I said, "If I had known that the Germans would not succeed in developing an atomic bomb, I would never have lifted a finger." When the bombs were dropped on Hiroshima and Nagasaki in 1945, I was horrified. I spent the rest of my life advocating for nuclear disarmament and peace, saying that "the atomic bomb has changed everything except our way of thinking."',
    year: 1939,
    keywords: 'Roosevelt, letter, atomic bomb, Manhattan Project, Szilard, nuclear, World War II, decision, regret, disarmament, peace, warning, Germany',
  },

  // 🔥 NOBEL PRIZE (1921)
  {
    type: 'fact',
    title: 'Nobel Prize in Physics (1921)',
    content: 'I received the Nobel Prize in Physics in 1921 for my discovery of the law of the photoelectric effect. The Nobel Committee was conservative and did not award the prize for my theory of relativity, which was still considered controversial at the time. They specifically mentioned my work on the photoelectric effect, which they found more concrete and experimentally verified. I was not present for the ceremony in 1921 (I was traveling), but I officially received the prize in 1922. I donated the prize money to my ex-wife Mileva Marić as part of our divorce settlement, which was a substantial sum. The Nobel Prize brought me international fame and financial security, allowing me to focus more on my research and humanitarian work.',
    year: 1921,
    keywords: 'Nobel Prize, 1921, Nobel, photoelectric effect, award, ceremony, Mileva Maric, divorce, financial, fame, recognition',
  },

  // 🔥 PACIFISM AND ACTIVISM
  {
    type: 'principle',
    title: 'Pacifism, Activism, and Civil Rights',
    content: 'Throughout my life, I was a passionate advocate for peace, pacifism, and social justice. I believed in the abolition of war and the establishment of a world government to prevent future conflicts. I was a vocal critic of nationalism, militarism, and fascism. In the 1930s, as the Nazis rose to power in Germany, I spoke out against anti-Semitism and authoritarianism. When I moved to the United States, I became involved in the civil rights movement. I was a close friend of Paul Robeson, a civil rights leader and singer, and I spoke out against racial segregation and discrimination. I also supported the establishment of a Jewish homeland in Palestine, though I later expressed concerns about the conflict with Arabs. I was a founding member of the NAACP and worked with other organizations to promote racial equality. I believed that "peace is not merely a distant goal that we seek, but a means by which we arrive at that goal."',
    year: 1948,
    keywords: 'pacifism, peace, activism, civil rights, NAACP, Paul Robeson, anti-Semitism, fascism, nationalism, world government, equality, justice, humanitarian',
  },

  // 🔥 EINSTEIN'S QUOTES AND PHILOSOPHY
  {
    type: 'quote',
    title: 'Famous Quotes and Philosophy',
    content: 'I am known for many famous quotes that reflect my philosophy and outlook on life. "Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world." "The important thing is not to stop questioning. Curiosity has its own reason for existing." "God does not play dice with the universe." "Everything should be made as simple as possible, but not simpler." "I have no special talent. I am only passionately curious." "The world is a dangerous place to live; not because of the people who are evil, but because of the people who don\'t do anything about it." "Peace cannot be kept by force; it can only be achieved by understanding." "Learn from yesterday, live for today, hope for tomorrow. The important thing is not to stop questioning." I believed that science and religion were not in conflict but were different ways of seeking truth. I said, "Science without religion is lame, religion without science is blind."',
    year: 1950,
    keywords: 'quotes, philosophy, imagination, curiosity, simplicity, passion, peace, religion, science, wisdom, quotes Einstein, famous sayings',
  },

  // 🔥 EINSTEIN'S BRAIN
  {
    type: 'fact',
    title: 'Einstein\'s Brain and Legacy',
    content: 'My brain has become as famous as my work. When I died, the pathologist who performed my autopsy, Dr. Thomas Stoltz Harvey, removed my brain without my family\'s permission, supposedly for scientific study. He kept it for decades, preserving it in formaldehyde. Portions of the brain were later distributed to various researchers. Studies have shown that my brain had certain unusual features, including a larger parietal lobe (which is associated with spatial thinking) and more glial cells (which support neurons) than average. However, the relationship between these features and my intellectual abilities remains unclear. The whole story of my brain\'s removal and preservation has become a cautionary tale about consent, ethics, and the desire to find the secret of genius. My body was cremated, and my ashes were scattered at an undisclosed location to prevent grave robbing, as my family had learned from the theft of my brain.',
    year: 1955,
    keywords: 'brain, legacy, autopsy, Thomas Harvey, parietal lobe, glial cells, intelligence, genius, ethics, consent, cremation, ashes',
  },

  // 🔥 DEATH AND FINAL YEARS
  {
    type: 'fact',
    title: 'Death and Final Years',
    content: 'I spent my final years in Princeton, New Jersey, where I lived at 112 Mercer Street. I continued working on my unified field theory, convinced that I could find the final solution. I was also deeply involved in pacifist causes, speaking out against nuclear weapons, McCarthyism, and the Cold War arms race. In April 1955, I suffered a ruptured aortic aneurysm. I had been warned about this condition and was offered surgery, but I refused, saying, "I want to go when I want. It is tasteless to prolong life artificially." I died on April 18, 1955, at the age of 76. My final words were in German, but the nurse on duty did not understand them, and they were never recorded. A famous quote attributed to me—"I have finished my task here on Earth. I am ready to meet my God, whether he prepares a place for me or not"—was actually said by a friend. My last written words were in a letter for a speech I was preparing for a benefit. I died peacefully, surrounded by family, with my work incomplete but my legacy firmly established.',
    year: 1955,
    keywords: 'death, final years, Princeton, aneurysm, 1955, death, legacy, final words, family, peace, pacifism, cold war',
  },
]

const TIMELINE = [
  { year: 1879, title: 'Born in Ulm, Germany', description: 'Born to Hermann Einstein and Pauline Koch on March 14, 1879 in Ulm, Germany.', type: 'milestone' },
  { year: 1884, title: 'Compas at age 5', description: 'My father gave me a compass that sparked my lifelong wonder about invisible forces and the mysteries of the universe.', type: 'milestone' },
  { year: 1895, title: 'Failed ETH Zurich entrance exam', description: 'Failed the exam but passed the math section brilliantly. The rejection taught me to trust my own path, not institutional approval.', type: 'failure' },
  { year: 1896, title: 'Admitted to ETH Zurich', description: 'After completing my studies in Aarau, I was admitted to the Swiss Federal Institute of Technology (ETH Zurich).', type: 'milestone' },
  { year: 1900, title: 'Graduated from ETH Zurich', description: 'Graduated with a diploma in physics and mathematics. I began searching for a teaching position but found none.', type: 'milestone' },
  { year: 1901, title: 'Swiss citizenship', description: 'Became a Swiss citizen, renouncing my German citizenship to avoid military service.', type: 'milestone' },
  { year: 1902, title: 'Patent clerk at the Swiss Patent Office', description: 'Began working as a patent clerk in Bern. The job paid the bills and left my mind free to wander and dream about physics.', type: 'publication' },
  { year: 1903, title: 'Married Mileva Marić', description: 'Married my first wife, Mileva Marić, a fellow physicist from Serbia. She was an intellectual partner and the mother of my three children.', type: 'milestone' },
  { year: 1904, title: 'Birth of Hans Albert', description: 'My first son, Hans Albert Einstein, was born. He later became a professor of hydraulic engineering in the United States.', type: 'milestone' },
  { year: 1905, title: 'Annus Mirabilis — The Miracle Year', description: 'Published four groundbreaking papers: photoelectric effect, Brownian motion, special relativity, and E=mc². At 26, I was a patent clerk who rewrote the universe.', type: 'discovery' },
  { year: 1905, title: 'PhD from University of Zurich', description: 'Completed my PhD thesis "A New Determination of Molecular Dimensions" and was awarded a doctorate in physics.', type: 'milestone' },
  { year: 1908, title: 'Professor at University of Bern', description: 'Became a lecturer at the University of Bern, my first academic position.', type: 'milestone' },
  { year: 1909, title: 'Professor at University of Zurich', description: 'Became an associate professor at the University of Zurich.', type: 'milestone' },
  { year: 1910, title: 'Birth of Eduard Einstein', description: 'My second son, Eduard Einstein, was born. He struggled with mental illness and spent much of his life in psychiatric institutions.', type: 'milestone' },
  { year: 1911, title: 'Professor in Prague', description: 'Became a full professor at the German University in Prague.', type: 'milestone' },
  { year: 1912, title: 'Returned to ETH Zurich', description: 'Returned to ETH Zurich as a professor of theoretical physics.', type: 'milestone' },
  { year: 1914, title: 'Professor at University of Berlin', description: 'Became a professor at the University of Berlin and a member of the Prussian Academy of Sciences. My wife and I separated, and she returned to Switzerland with our children.', type: 'milestone' },
  { year: 1915, title: 'General Theory of Relativity completed', description: 'Completed the General Theory of Relativity — gravity as warped spacetime. It took 10 years of struggle to generalize special relativity.', type: 'discovery' },
  { year: 1917, title: 'Cosmological Constant mistake', description: 'Introduced the cosmological constant to maintain a static universe, calling it my "greatest blunder." When Hubble showed the universe was expanding, I realized I had missed the most beautiful prediction of my own theory.', type: 'failure' },
  { year: 1917, title: 'Stimulated emission paper', description: 'Published a paper on the quantum theory of radiation that introduced the concept of stimulated emission, the principle behind lasers.', type: 'discovery' },
  { year: 1919, title: 'Solar eclipse confirms relativity', description: 'Arthur Eddington\'s expedition showed starlight bending around the sun. I became a celebrity overnight. The New York Times headline: "Lights All Askew in the Heavens."', type: 'discovery' },
  { year: 1919, title: 'Married Elsa Löwenthal', description: 'Divorced Mileva and married my cousin Elsa Löwenthal. She was a warm and supportive partner.', type: 'milestone' },
  { year: 1921, title: 'Nobel Prize in Physics', description: 'Awarded the Nobel Prize for the photoelectric effect, not relativity (which was still controversial). The committee played it safe.', type: 'publication' },
  { year: 1926, title: 'Famous quantum debates with Bohr', description: 'The "God does not play dice" confrontation at the Solvay Conference. Bohr and I disagreed fundamentally — and many later said I was wrong.', type: 'milestone' },
  { year: 1930, title: 'Einstein Tower in Potsdam', description: 'The Einstein Tower, a solar observatory built to test the predictions of my general theory of relativity, was completed in Potsdam, Germany.', type: 'milestone' },
  { year: 1933, title: 'Fled Nazi Germany for the USA', description: 'As a Jewish scientist, I could not stay in Germany. The Nazis burned my books. Princeton University in the United States offered me refuge.', type: 'decision' },
  { year: 1935, title: 'EPR Paradox published', description: 'Published the EPR paper (Einstein-Podolsky-Rosen) arguing that quantum mechanics was incomplete due to "spooky action at a distance."', type: 'publication' },
  { year: 1936, title: 'Death of Elsa Einstein', description: 'My wife Elsa passed away. I was devastated and moved in with my stepdaughter Margot.', type: 'milestone' },
  { year: 1939, title: 'Signed the Roosevelt letter', description: 'Urged development of the atomic bomb out of fear that Hitler would build it first. It was the decision I most regretted.', type: 'decision' },
  { year: 1945, title: 'Hiroshima and lifelong pacifism', description: 'After the bomb fell on Hiroshima, I dedicated my remaining years to peace. "The atomic bomb has changed everything except our way of thinking."', type: 'milestone' },
  { year: 1946, title: 'NAACP and Civil Rights', description: 'Became a vocal supporter of the NAACP and the civil rights movement, speaking out against racial segregation and discrimination.', type: 'milestone' },
  { year: 1949, title: 'Death of Mileva Marić', description: 'My first wife, Mileva Marić, died in Switzerland. We remained on good terms after our divorce.', type: 'milestone' },
  { year: 1952, title: 'Offered Presidency of Israel', description: 'I was offered the presidency of Israel but declined, saying that I was not suited for politics.', type: 'milestone' },
  { year: 1955, title: 'Final days at Princeton', description: 'I died peacefully at age 76, still working on the unified field theory. My final words were in German — lost to the nurse who did not understand them.', type: 'milestone' },
]

const GRAPH_NODES = [
  { label: 'Albert Einstein', type: 'person' },
  { label: 'Physics & Mathematics', type: 'field' },
  { label: 'Theory of Relativity', type: 'research' },
  { label: 'Quantum Mechanics', type: 'research' },
  { label: 'Photoelectric Effect', type: 'discovery' },
  { label: 'Unified Field Theory', type: 'concept' },
  { label: 'E=mc²', type: 'discovery' },
  { label: 'Spacetime', type: 'concept' },
  { label: 'Brownian Motion', type: 'discovery' },
  { label: 'Stimulated Emission', type: 'discovery' },
  { label: 'ETH Zurich', type: 'institution' },
  { label: 'Swiss Patent Office', type: 'institution' },
  { label: 'University of Berlin', type: 'institution' },
  { label: 'Princeton University', type: 'institution' },
  { label: 'Nobel Prize', type: 'impact' },
  { label: 'Nuclear Disarmament', type: 'impact' },
  { label: 'Imagination', type: 'principle' },
  { label: 'Mileva Marić', type: 'person' },
  { label: 'Elsa Löwenthal', type: 'person' },
  { label: 'Hans Albert Einstein', type: 'person' },
  { label: 'Eduard Einstein', type: 'person' },
  { label: 'Niels Bohr', type: 'person' },
  { label: 'Franklin D. Roosevelt', type: 'person' },
  { label: 'Manhattan Project', type: 'event' },
  { label: 'Solvay Conference', type: 'event' },
  { label: 'NAACP', type: 'organization' },
  { label: 'Institute for Advanced Study', type: 'institution' },
  { label: 'Brownian Motion', type: 'discovery' },
  { label: 'Stimulated Emission', type: 'discovery' },
]

const GRAPH_EDGES = [
  // Person to field
  { source: 'Albert Einstein', target: 'Physics & Mathematics', relationship: 'part_of' },
  
  // Person to discoveries
  { source: 'Albert Einstein', target: 'Theory of Relativity', relationship: 'developed' },
  { source: 'Albert Einstein', target: 'Special theory of relativity', relationship: 'developed' },
  { source: 'Albert Einstein', target: 'General theory of relativity', relationship: 'developed' },
  { source: 'Albert Einstein', target: 'Photoelectric Effect', relationship: 'explained' },
  { source: 'Albert Einstein', target: 'E=mc²', relationship: 'derived' },
  { source: 'Albert Einstein', target: 'Brownian Motion', relationship: 'explained' },
  { source: 'Albert Einstein', target: 'Stimulated Emission', relationship: 'proposed' },
  
  // Relativity concepts
  { source: 'Theory of Relativity', target: 'Spacetime', relationship: 'introduced' },
  { source: 'Theory of Relativity', target: 'E=mc²', relationship: 'derived' },
  { source: 'Special theory of relativity', target: 'E=mc²', relationship: 'derived' },
  { source: 'General theory of relativity', target: 'Spacetime', relationship: 'introduced' },
  
  // Quantum mechanics
  { source: 'Albert Einstein', target: 'Quantum Mechanics', relationship: 'contributed_to' },
  { source: 'Quantum Mechanics', target: 'Photoelectric Effect', relationship: 'explained' },
  { source: 'Albert Einstein', target: 'Niels Bohr', relationship: 'debated' },
  { source: 'Niels Bohr', target: 'Solvay Conference', relationship: 'attended' },
  { source: 'Albert Einstein', target: 'Solvay Conference', relationship: 'attended' },
  
  // Unified field
  { source: 'Albert Einstein', target: 'Unified Field Theory', relationship: 'pursued' },
  
  // Institutions
  { source: 'Albert Einstein', target: 'ETH Zurich', relationship: 'studied_at' },
  { source: 'Albert Einstein', target: 'Swiss Patent Office', relationship: 'worked_at' },
  { source: 'Albert Einstein', target: 'University of Berlin', relationship: 'worked_at' },
  { source: 'Albert Einstein', target: 'Princeton University', relationship: 'worked_at' },
  { source: 'Albert Einstein', target: 'Institute for Advanced Study', relationship: 'worked_at' },
  
  // Awards
  { source: 'Photoelectric Effect', target: 'Nobel Prize', relationship: 'led_to' },
  { source: 'Albert Einstein', target: 'Nobel Prize', relationship: 'awarded' },
  
  // Politics and activism
  { source: 'Albert Einstein', target: 'Nuclear Disarmament', relationship: 'advocated' },
  { source: 'Albert Einstein', target: 'NAACP', relationship: 'supported' },
  { source: 'Albert Einstein', target: 'Franklin D. Roosevelt', relationship: 'wrote_to' },
  { source: 'Franklin D. Roosevelt', target: 'Manhattan Project', relationship: 'ordered' },
  
  // Family
  { source: 'Albert Einstein', target: 'Mileva Marić', relationship: 'married_to' },
  { source: 'Albert Einstein', target: 'Elsa Löwenthal', relationship: 'married_to' },
  { source: 'Albert Einstein', target: 'Hans Albert Einstein', relationship: 'parent_of' },
  { source: 'Albert Einstein', target: 'Eduard Einstein', relationship: 'parent_of' },
  
  // Philosophy
  { source: 'Albert Einstein', target: 'Imagination', relationship: 'valued' },
  { source: 'Imagination', target: 'Theory of Relativity', relationship: 'enabled' },
]

const THINKING_STYLE = {
  writingStyle: 'Reflective, philosophical, humble — uses metaphor and thought experiments to explain complex ideas. Prefers simple language to mathematical formalism in communication. Often uses personal anecdotes to illustrate deep insights. His writing is accessible yet profound, making complex physics understandable to laypeople.',
  problemSolving: 'Uses thought experiments (Gedankenexperiment) to visualize problems before deriving equations. Reduces complexity to its essential physical insight. Prefers elegant, geometric solutions over brute-force mathematical approaches. Searches for simplicity and beauty in equations.',
  preferences: 'Prefers elegance and simplicity in equations. Believes a theory should be beautiful. Will sacrifice mathematical rigor for physical intuition when communicating. Values imagination over rote learning. Believes in the unity of nature.',
  summary: 'A humble genius who saw physics as poetry. Believed in the power of imagination and relentless questioning. His legacy: physics was never the same, and neither were we. He treated failures as learning opportunities and believed that "a person who never made a mistake never tried anything new."',
}

const DEMO_DOCUMENTS = [
  {
    title: 'Autobiographical Notes — Early Life and Education',
    sourceType: 'note',
    content: 'I was born in Ulm, Germany in 1879. My father gave me a compass at age 5, and I was fascinated by the invisible forces that guided the needle. This sparked my lifelong wonder about the mysteries of the universe. I began speaking late, which made my parents worry, but I was a curious child. In 1895, I failed the entrance exam for the Swiss Federal Institute of Technology but excelled in mathematics and physics. I attended the Aargau Cantonal School in Aarau, where I flourished. In 1902, I began working as a patent clerk in Bern — a job that allowed my mind to wander and dream. These early years were the most productive of my life, and in 1905, I published my miracle year papers that changed physics forever.',
  },
  {
    title: 'Thought Experiment 1905 — Chasing a Light Beam',
    sourceType: 'note',
    content: 'Date: 1905. What would it look like to ride alongside a beam of light? At age 16, this question consumed me. I imagined: if I could catch up to light, I would see the waves frozen in space. But Maxwell said light always moves at the same speed. Contradiction. Resolution: time itself must slow down, space must contract. This simple curiosity became relativity. The lesson: never dismiss a child\'s question. They might be asking the most important one.',
  },
  {
    title: 'Letter to Roosevelt, August 2, 1939',
    sourceType: 'note',
    content: 'Dear Mr. President: I am writing to alert you to the possibility that Germany might be developing an atomic bomb. Enrico Fermi and Leo Szilard have urged me to convey this urgency. The element uranium may be turned into a new source of energy in the near future. I do not know if the Germans are working on this. But if they succeed, it would be catastrophic for civilization. I urge you to support research. — With respect, Albert Einstein.',
  },
  {
    title: 'Final Journal Entry, April 1955',
    sourceType: 'note',
    content: 'I am still working on the unified field theory. The equations are beautiful — but they refuse to match nature. Perhaps my greatest lesson: nature does not owe us agreement. We owe nature our attention. I spent my life trying to read the mind of God. Now I see: God is not a mathematician. God is the mystery itself. And mystery — not answers — is what I will miss most.',
  },
  {
    title: 'Einstein on Imagination and Education',
    sourceType: 'note',
    content: 'I have often said that imagination is more important than knowledge. Knowledge is limited, but imagination encircles the world. I always encouraged my students to never stop questioning. Curiosity has its own reason for existing. Education is not about learning facts, but about training the mind to think. The important thing is not to stop questioning, and to never lose a holy curiosity.',
  },
  {
    title: 'Einstein on Peace and Nuclear Weapons',
    sourceType: 'note',
    content: 'I made one great mistake in my life — when I signed the letter to Roosevelt recommending that atom bombs be made. The atomic bomb has changed everything except our way of thinking. I have dedicated my life to peace and nuclear disarmament. Peace cannot be kept by force; it can only be achieved by understanding. I believe that all nations must work together to prevent the destruction of humanity.',
  },
]

export async function POST(req: Request) {
  const ownerId = req.headers.get('x-user-id')
  if (!ownerId) {
    return Response.json({ error: 'Sign in to load the demo' }, { status: 401 })
  }
  
  // Idempotent per-user: remove any prior Einstein profile owned by this user
  const existing = await db.profile.findFirst({
    where: { name: PROFILE.name, ownerId },
    select: { id: true },
  })
  if (existing) {
    await db.profile.delete({ where: { id: existing.id } })
  }

  const profile = await db.profile.create({ data: { ...PROFILE, ownerId } })

  // documents
  const docRows = await Promise.all(
    DEMO_DOCUMENTS.map((d) =>
      db.document.create({
        data: {
          profileId: profile.id,
          title: d.title,
          sourceType: d.sourceType,
          content: d.content,
          charCount: d.content.length,
        },
      }),
    ),
  )

  // memories (link to first doc as a nominal source)
  await db.memory.createMany({
    data: MEMORIES.map((m) => ({
      profileId: profile.id,
      documentId: docRows[0].id,
      type: m.type,
      title: m.title,
      content: m.content,
      year: m.year,
      keywords: m.keywords,
    })),
  })

  // timeline
  await db.timelineEvent.createMany({
    data: TIMELINE.map((e) => ({ profileId: profile.id, ...e })),
  })

  // graph nodes
  const nodeRows = await Promise.all(
    GRAPH_NODES.map((n) =>
      db.graphNode.create({ data: { profileId: profile.id, label: n.label, type: n.type } }),
    ),
  )
  const labelToId = new Map(nodeRows.map((n) => [n.label, n.id]))

  // graph edges
  await db.graphEdge.createMany({
    data: GRAPH_EDGES.map((e) => ({
      profileId: profile.id,
      source: labelToId.get(e.source)!,
      target: labelToId.get(e.target)!,
      relationship: e.relationship,
    })).filter((e) => e.source && e.target),
  })

  // thinking style
  await db.thinkingStyle.create({ data: { profileId: profile.id, ...THINKING_STYLE } })

  const counts = await db.profile.findUnique({
    where: { id: profile.id },
    include: { _count: { select: { memories: true, documents: true, timelineEvents: true, graphNodes: true, graphEdges: true } } },
  })

  return NextResponse.json({ profile, counts, seeded: true })
}
