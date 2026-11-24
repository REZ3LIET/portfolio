# Metacognition in LLMs Taxonomy

## Evaluation
### Introspection
#### Distinguishing Metacognition
- Problem: Existing works in introspection fail to distinguish between metacognition and application of general knowledge and  text-based self-simulation.
- Source: Me, Myself, and $\pi$ : Evaluating and Explaining LLM Introspection	https://iclr.cc/virtual/2026/10020769

### Self-Assessment
#### Survey of Existing Methods
- Problem: Although LLMs are proficient in NLP tasks, their metacognitive abilities like self-assessment, uncertainty awareness and cognitive control remain under-explored. 
- Source: Do AI know what they know? Exploring metacognition in LLMs	https://journals.sagepub.com/doi/full/10.1177/1088467X261436903
#### Disjoint Developments
- Problem: Metacognition has gained significant attention leading to many developments across the field. However, most of these developments are disjoint and have less comparability across systems.
- Source: How metacognitive architectures remember their own thoughts: a systematic scoping review	https://link.springer.com/article/10.1007/s10462-026-11669-5

### Self-Awareness
#### Limited Metacognition
- Problem: Authors highlight the nascent stages of evaluation of LLM metacognition
- Source: Evidence for Limited Metacognition in LLMs	https://proceedings.iclr.cc/paper_files/paper/2026/hash/fb1b96eda4282f137f9a9953a4db2d74-Abstract-Conference.html
#### Confidence Judgement
- Problem: Advances in LLMs have raised concerns over their reliability, as LLMs express high-confidence in their outputs authors question if GPT-4 has meta-cognitive abilities similar to a human.
- Source: Metacognition of ChatGPT in confidence judgements	https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2026.1694192/full

### Self-Confidence
#### Signs of Individuated Metacognition
- Problem: Existing works like confidence-weighted routing and selective abstention rely on the confidence of LLM which presume LLMs metacognitive capabilities that is underexplored. Some researchers have used aggregate calibration but the underlying structure of elicited confidence is not well understood.
- Source: LLMs Show No Signs Of Individuated Metacognition	https://neurips.cc/virtual/2026/poster/148364
#### Granular Analysis and Adaptation
- Problem: Existing research on LLMs error detection capabilities relied on cognitive processes by using prompts to analyze reasoning chains. While, some studies propose measure that can be classified under meta-cognition they lack step-level analysis and adaptation. 
- Source: Large Language Models Have Intrinsic Meta-Cognition, but Need a Good Lens	https://aclanthology.org/2025.emnlp-main.171/

### Self-Monitoring
#### Interpretable Metacognition
- Problem: LLMs show limited metacognitive capabilities as they report strategies to solve task but are unable to do the same for their own behavior. Enhanced metacognitive capability can enable them solve complex tasks but also lead to security concerns if they obfuscate their internal processes to evade detection.
- Source: Language Models Are Capable of Metacognitive Monitoring and Control of Their Internal Activations	https://proceedings.neurips.cc/paper_files/paper/2025/hash/56a225639da77e8f7c0409f6d5ba996b-Abstract-Conference.html
#### Uncertainty Communication
- Problem: Authors define metacognition as the ability to monitor one's own knowledge and performance as foundations to human decision-making, learning and communication. They further question if, how and to what extent to LLMs possess metacognitive capabilities and propose an evaluation study.
- Source: Metacognition and Uncertainty Communication in Humans and Large Language Models	https://journals.sagepub.com/doi/full/10.1177/09637214251391158

### Self-Knowledge
#### Disentangling Heuristics, Bias, and Self-Knowledge
- Problem: Metacognition involves understanding what knowledge one knows or referred to as self-knowledge. However, existing methods of analysing self-knowledge use different heuristics such as task difficulty  and do not disentangle the heuristics, biases and self-knowledge. 
- Source: Fine-Tuning Language Models to Know What They Know	https://neurips.cc/virtual/2026/poster/149889
#### Evidence of Metacognitive Knowledge
- Problem: Authors develop a framework to explore and validate the metacognitive knowledge capabilities of LLMs in terms of labelling skills and procedures for mathematical models
- Source: Metacognitive Capabilities of LLMs: An Exploration in Mathematical Problem Solving	https://proceedings.neurips.cc/paper_files/paper/2024/hash/2318d75a06437eaa257737a5cf3ab83c-Abstract-Conference.html

### Perceptual Metacognition
#### Underexplored
- Problem: VLMs have demonstrated unprecedented reasoning capabilities in perception and reasoning. However, their perceptual metacognitive abilities remain unexplored. 
- Source: Assessing Perceptual Metacognition in Vision-Language Models	https://escholarship.org/uc/item/6xk941fr

### Metacognitive Control
#### Underexplored Prospective Metacognitive Control
- Problem: Deployment of LLM agents involves more than task accuracy, they should also be capable of managing and planning for execution environment. This prospective form of metacognitive control is underexplored for LLMs. 
- Source: TRIAGE: Evaluating Prospective Metacognitive Control in LLMs under Resource Constraints	https://neurips.cc/virtual/2026/poster/139419

## Methods
### Self-Improvement
#### Theoretical Grounding and Generalizable across Architecture
- Problem: Existing works on metacognition for LLM agents lack theoretical grounding and the metacognitive processes are limited by the cognitive architecture. 
- Source: CLMC: Code-Level Metacognition for LLM Agents	https://ieeexplore.ieee.org/abstract/document/11415858
#### Efficient and Cost-effectiveness
- Problem: Existing self-improving frameworks rely on inefficient, multi-turn recursive loops that incur high computational costs.
- Source: Learn Like Humans: Use Meta-cognitive Reflection for Efficient Self-Improvement	https://aclanthology.org/2026.acl-long.1329/

### Self-Awareness
#### Uncertainty Awareness
- Problem: LLMs struggle with their own uncertainty that undermines their trust and reliability of their capabilities.
- Source: Implementation of a Metacognition Framework for Self-Awareness and Self-Regulation in Ensembles of LLMs	https://dl.acm.org/doi/abs/10.1145/3774905.3793124
#### Uncertainty Quantification
- Problem: LLMs struggle with their own uncertainty and self-assessment that are core aspects of metacognition.
- Source: Physics-Informed Metacognition: Improving LLMs Self-Knowledge via Physical Constraints	https://openreview.net/forum?id=LF4RSTZUtA&noteId=LF4RSTZUtA
#### Lack of Awareness
- Problem: Recent studies show LLMs struggle with tasks demanding creative, lateral thinking due to a lack in awareness of their own reasoning process.
- Source: MP: Endowing Large Language Models with Lateral Thinking	https://ojs.aaai.org/index.php/AAAI/article/view/34514

### Self-Confidence
#### Overconfidence or Hallucination
- Problem: LLMs suffer from critical metacognitive deficits manifesting as overconfidence or hallucinations.
- Source: Predictive metacognition: a neuro-computational framework for self-monitoring in large language models	https://www.nature.com/articles/s41598-026-54840-2

### Self-Monitoring
#### Uncertainty Monitoring - Confidence Attribution
- Problem: Uncertainty monitoring is a core component of metacognition which is knowing what one doesn't know. However, it is unclear if the LLM's confidence related behavior stems from internal uncertainty representations or task-specific heuristics shaped by prompts or surface-level cues.
- Source: Reusable Uncertainty Representations Support Metacognitive Behavior in Llama-3.3-70B	https://icml.cc/virtual/2026/79301
