<template>
  <main>
    <div class="container card">
      <h1 class="title">ADHD Questionnaire</h1>
      <div style="margin-bottom:2em;text-align:center">
        <label style="font-weight:500">Share your answers (partial or complete):</label>
        <div style="display:flex;align-items:center;gap:0.5em;width:100%;justify-content:center">
          <input type="text" :value="shareUrl" readonly style="flex:1;width:100%;margin-top:0.5em;padding:0.5em;border-radius:6px;border:1px solid #e0e0e0;font-size:0.95em" />
          <button type="button" class="btn" style="margin-top:0.5em;padding:0.5em 1em;font-size:1em;min-width:80px;" @click="copyShareUrl">Copy</button>
        </div>
        <div style="font-size:0.9em;color:#555;margin-top:0.5em">Copy and share this link. Anyone visiting it will see your answers pre-filled.</div>
      </div>
      <form @submit.prevent="submitAnswers">
        <div class="age-selector">
          <label for="age-group">Are you <span class="mono">&gt;16</span> years old?</label>
          <select id="age-group" v-model="isAdult" class="select">
            <option :value="true">Yes</option>
            <option :value="false">No</option>
          </select>
        </div>
        <h2 class="subtitle">Inattention Questions</h2>
        <div v-for="(q, idx) in questionsGroup1" :key="q.id" class="question-block">
          <div class="question-text">{{ q.question }}</div>
          <div class="toggle-group">
            <label :class="['toggle', answersGroup1[idx] === 'yes' ? 'active' : '']">
              <input type="radio" :name="'inattention-' + q.id" value="yes" v-model="answersGroup1[idx]" />
              Yes
            </label>
            <label :class="['toggle', answersGroup1[idx] === 'no' ? 'active' : '']">
              <input type="radio" :name="'inattention-' + q.id" value="no" v-model="answersGroup1[idx]" />
              No
            </label>
          </div>
        </div>
        <h2 class="subtitle">Hyperactivity/Impulsivity Questions</h2>
        <div v-for="(q, idx) in questionsGroup2" :key="q.id" class="question-block">
          <div class="question-text">{{ q.question }}</div>
          <div class="toggle-group">
            <label :class="['toggle', answersGroup2[idx] === 'yes' ? 'active' : '']">
              <input type="radio" :name="'hyperactivity-' + q.id" value="yes" v-model="answersGroup2[idx]" />
              Yes
            </label>
            <label :class="['toggle', answersGroup2[idx] === 'no' ? 'active' : '']">
              <input type="radio" :name="'hyperactivity-' + q.id" value="no" v-model="answersGroup2[idx]" />
              No
            </label>
          </div>
        </div>
        <button type="submit" class="btn">Submit</button>
        <div v-if="error" class="error-message">Please answer all questions before submitting.</div>
      </form>
      <transition name="fade">
        <div v-if="showResult" class="grading-result card">
          <h3 class="result-title">Screening Result</h3>
          <ul>
            <li><strong>Inattention:</strong> <span class="mono">{{ inattentionYes }}</span> Yes</li>
            <li><strong>Hyperactivity/Impulsivity:</strong> <span class="mono">{{ hyperYes }}</span> Yes</li>
            <li><strong>Total Yes:</strong> <span class="mono">{{ totalYes }}</span></li>
          </ul>
          <div v-if="isAdult">
            <div v-if="inattentionYes >= 4" class="result-positive">Positive Inattention Screening (Adult)</div>
            <div v-if="hyperYes >= 4" class="result-positive">Positive Hyperactive/Impulsive Screening (Adult)</div>
            <div v-if="totalYes >= 7" class="result-positive">Overall ADHD Likelihood (Adult): Top 5–7% symptom frequency</div>
            <div v-if="inattentionYes < 4 && hyperYes < 4 && totalYes < 7" class="result-negative">Screening below threshold for ADHD likelihood (Adult)</div>
          </div>
          <div v-else>
            <div v-if="inattentionYes >= 6" class="result-positive">Positive Inattention Screening (Child)</div>
            <div v-if="hyperYes >= 6" class="result-positive">Positive Hyperactive/Impulsive Screening (Child)</div>
            <div v-if="inattentionYes >= 6 || hyperYes >= 6" class="result-positive">Overall ADHD Likelihood (Child): Meets category threshold</div>
            <div v-if="inattentionYes < 6 && hyperYes < 6" class="result-negative">Screening below threshold for ADHD likelihood (Child)</div>
          </div>
          <p class="note">Meeting or exceeding the symptom count threshold does not constitute a diagnosis. A positive screen increases the likelihood of ADHD and indicates the need for professional evaluation.</p>
        </div>
      </transition>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';

const questionsGroup1 = [
  { id: 1, question: "Do you often fail to give close attention to details or make careless mistakes in schoolwork, at work, or during other activities?" },
  { id: 2, question: "Do you often have difficulty sustaining attention in tasks or in play activities?" },
  { id: 3, question: "Do you often not seem to listen when spoken to directly?" },
  { id: 4, question: "Do you often not follow through on instructions and fail to finish schoolwork, chores, or duties in the workplace?" },
  { id: 5, question: "Do you often have difficulty organizing tasks and activities?" },
  { id: 6, question: "Do you often avoid, dislike, or are reluctant to engage in tasks that require sustained mental effort?" },
  { id: 7, question: "Do you often lose things necessary for tasks or activities?" },
  { id: 8, question: "Are you often easily distracted by extraneous stimuli or unrelated thoughts?" },
  { id: 9, question: "Do you often find that you are forgetful in daily activities?" }
];

const questionsGroup2 = [
  { id: 1, question: "Do you often fidget with or tap your hands or feet, or squirm in your seat?" },
  { id: 2, question: "Do you often leave your seat in situations when remaining seated is expected?" },
  { id: 3, question: "Do you often run about or feel internally restless in inappropriate situations?" },
  { id: 4, question: "Are you often unable to play or engage in leisure activities quietly?" },
  { id: 5, question: "Are you often on the go or act as if driven by a motor?" },
  { id: 6, question: "Do you often talk excessively?" },
  { id: 7, question: "Do you often blurt out an answer before a question has been completed?" },
  { id: 8, question: "Do you often have difficulty awaiting your turn in situations such as waiting in line?" },
  { id: 9, question: "Do you often interrupt or intrude on others?" }
];

const answersGroup1 = ref<string[]>(Array(questionsGroup1.length).fill(''));
const answersGroup2 = ref<string[]>(Array(questionsGroup2.length).fill(''));


onMounted(() => {
  // Check for answers in URL
  const params = new URLSearchParams(window.location.search);
  const a1 = params.get('a1');
  const a2 = params.get('a2');
  const adult = params.get('adult');
  if (a1 && a2 && adult !== null) {
    try {
      const arr1 = JSON.parse(decodeURIComponent(a1));
      const arr2 = JSON.parse(decodeURIComponent(a2));
      const isAdultVal = JSON.parse(decodeURIComponent(adult));
      if (Array.isArray(arr1) && Array.isArray(arr2) && typeof isAdultVal === 'boolean') {
        answersGroup1.value = arr1.length === questionsGroup1.length ? arr1 : Array(questionsGroup1.length).fill('');
        answersGroup2.value = arr2.length === questionsGroup2.length ? arr2 : Array(questionsGroup2.length).fill('');
        isAdult.value = isAdultVal;
        // Save to localStorage
        localStorage.setItem('adhdtest-answers', JSON.stringify({ answersGroup1: arr1, answersGroup2: arr2, isAdult: isAdultVal }));
      }
    } catch {}
  } else {
    // Load answers from localStorage if available
    const saved = localStorage.getItem('adhdtest-answers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.answersGroup1) && Array.isArray(parsed.answersGroup2) && typeof parsed.isAdult === 'boolean') {
          answersGroup1.value = parsed.answersGroup1.length === questionsGroup1.length ? parsed.answersGroup1 : Array(questionsGroup1.length).fill('');
          answersGroup2.value = parsed.answersGroup2.length === questionsGroup2.length ? parsed.answersGroup2 : Array(questionsGroup2.length).fill('');
          isAdult.value = parsed.isAdult;
        }
      } catch {}
    }
  }
});

const error = ref(false);
const isAdult = ref(true); // true = >16 years old
const showResult = ref(false);

const shareUrl = computed(() => {
  return `${window.location.origin}${window.location.pathname}?a1=${JSON.stringify(answersGroup1.value)}&a2=${JSON.stringify(answersGroup2.value)}&adult=${JSON.stringify(isAdult.value)}`;
});

// Watch for changes and save to localStorage
watch([answersGroup1, answersGroup2, isAdult], ([a1, a2, adult]) => {
  localStorage.setItem('adhdtest-answers', JSON.stringify({ answersGroup1: a1, answersGroup2: a2, isAdult: adult }));
}, { deep: true });

const inattentionYes = ref(0);
const hyperYes = ref(0);
const totalYes = ref(0);

function submitAnswers() {
  error.value = false;
  showResult.value = false;
  // Check if all questions are answered
  const allAnswered1 = answersGroup1.value.every(ans => ans === 'yes' || ans === 'no');
  const allAnswered2 = answersGroup2.value.every(ans => ans === 'yes' || ans === 'no');
  if (!allAnswered1 || !allAnswered2) {
    error.value = true;
    return;
  }
  // Grading logic
  inattentionYes.value = answersGroup1.value.filter(ans => ans === 'yes').length;
  hyperYes.value = answersGroup2.value.filter(ans => ans === 'yes').length;
  totalYes.value = inattentionYes.value + hyperYes.value;
  showResult.value = true;
  // Save answers to localStorage (redundant, but ensures latest)
  localStorage.setItem('adhdtest-answers', JSON.stringify({ answersGroup1: answersGroup1.value, answersGroup2: answersGroup2.value }));
}

function copyShareUrl() {
  const input = document.createElement('input');
  input.value = shareUrl.value;
  document.body.appendChild(input);
  input.select();
  input.setSelectionRange(0, 99999); // For mobile devices
  document.execCommand('copy');
  document.body.removeChild(input);
}
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600&display=swap');
  body, .container {
    font-family: 'Quicksand', system-ui, sans-serif;
    background: #f7f8fa;
    color: #222;
  }
  .container {
    max-width: 600px;
    margin: 3em auto;
    padding: 2em 2.5em;
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 4px 32px 0 rgba(60, 80, 120, 0.08);
    transition: box-shadow 0.2s;
  }
  .card {
    box-shadow: 0 2px 16px 0 rgba(60, 80, 120, 0.10);
    border-radius: 18px;
    background: #fff;
  }
  .title {
    font-size: 2.2em;
    font-weight: 600;
    margin-bottom: 0.5em;
    letter-spacing: -1px;
    text-align: center;
  }
  .subtitle {
    font-size: 1.3em;
    font-weight: 600;
    margin: 2em 0 1em 0;
    color: #4f8cff;
    letter-spacing: -0.5px;
  }
  .age-selector {
    margin-bottom: 2em;
    display: flex;
    align-items: center;
    gap: 1em;
  }
  .select {
    padding: 0.4em 1em;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    background: #f7f8fa;
    font-size: 1em;
    outline: none;
    transition: border-color 0.2s;
  }
  .select:focus {
    border-color: #4f8cff;
  }
  .question-block {
    margin-bottom: 2em;
    padding: 1em 1.2em;
    background: #f7f8fa;
    border-radius: 12px;
    box-shadow: 0 1px 4px 0 rgba(60, 80, 120, 0.04);
    transition: box-shadow 0.2s;
  }
  .question-block:hover {
    box-shadow: 0 2px 8px 0 rgba(60, 80, 120, 0.08);
  }
  .question-text {
    font-size: 1.08em;
    margin-bottom: 0.7em;
    font-weight: 500;
    color: #222;
  }
  .toggle-group {
    display: flex;
    gap: 1.5em;
  }
  .toggle {
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.4em 1.2em;
    border-radius: 8px;
    background: #e9eefc;
    color: #357ae8;
    font-weight: 500;
    cursor: pointer;
    border: 1.5px solid transparent;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
    user-select: none;
  }
  .toggle input[type="radio"] {
    display: none;
  }
  .toggle.active {
    background: #4f8cff;
    color: #fff;
    border-color: #357ae8;
    box-shadow: 0 2px 8px 0 rgba(60, 80, 120, 0.10);
  }
  .btn {
    margin-top: 2em;
    padding: 0.7em 2.5em;
    font-size: 1.1em;
    background: linear-gradient(90deg, #4f8cff 60%, #357ae8 100%);
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    box-shadow: 0 2px 8px 0 rgba(60, 80, 120, 0.10);
    transition: background 0.2s;
  }
  .btn:hover {
    background: linear-gradient(90deg, #357ae8 60%, #4f8cff 100%);
  }
  .error-message {
    color: #d8000c;
    background: #ffd2d2;
    border: 1px solid #d8000c;
    padding: 0.7em 1.2em;
    margin-top: 1em;
    border-radius: 8px;
    font-weight: 500;
    display: inline-block;
    box-shadow: 0 1px 4px 0 rgba(216, 0, 12, 0.08);
  }
  .grading-result {
    margin-top: 2em;
    padding: 1.5em 2em;
    background: #f6f8fa;
    border-radius: 18px;
    border: 1px solid #e0e0e0;
    box-shadow: 0 2px 16px 0 rgba(60, 80, 120, 0.10);
    font-size: 1.08em;
    color: #222;
  }
  .grading-result ul {
    margin-bottom: 1em;
    padding-left: 1em;
  }
  .grading-result li {
    margin-bottom: 0.5em;
    font-size: 1.05em;
  }
  .result-title {
    font-size: 1.3em;
    font-weight: 600;
    margin-bottom: 1em;
    color: #357ae8;
    text-align: center;
  }
  .result-positive {
    color: #357ae8;
    font-weight: 600;
    margin-bottom: 0.5em;
  }
  .result-negative {
    color: #d8000c;
    font-weight: 600;
    margin-bottom: 0.5em;
  }
  .note {
    font-size: 0.95em;
    color: #555;
    margin-top: 1em;
    text-align: center;
  }
  .mono {
    font-family: 'Fira Mono', 'Menlo', 'Monaco', monospace;
    font-size: 1em;
    background: #e9eefc;
    border-radius: 4px;
    padding: 0.1em 0.5em;
  }
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s;
  }
  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
</style>