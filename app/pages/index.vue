<template>
  <main>
    <div class="container">
      <h1>ADHD Questionnaire</h1>
      <form @submit.prevent="submitAnswers">
        <div class="age-selector">
          <label for="age-group">Are you &gt;16 years old?</label>
          <select id="age-group" v-model="isAdult">
            <option :value="true">Yes</option>
            <option :value="false">No</option>
          </select>
        </div>
        <h2>Inattention Questions</h2>
        <div v-for="(q, idx) in questionsGroup1" :key="q.id" class="question-block">
          <label :for="'inattention-' + q.id">{{ q.question }}</label>
          <div>
            <input type="radio" :id="'inattention-yes-' + q.id" :name="'inattention-' + q.id" value="yes" v-model="answersGroup1[idx]" />
            <label :for="'inattention-yes-' + q.id">Yes</label>
            <input type="radio" :id="'inattention-no-' + q.id" :name="'inattention-' + q.id" value="no" v-model="answersGroup1[idx]" />
            <label :for="'inattention-no-' + q.id">No</label>
          </div>
        </div>
        <h2>Hyperactivity/Impulsivity Questions</h2>
        <div v-for="(q, idx) in questionsGroup2" :key="q.id" class="question-block">
          <label :for="'hyperactivity-' + q.id">{{ q.question }}</label>
          <div>
            <input type="radio" :id="'hyperactivity-yes-' + q.id" :name="'hyperactivity-' + q.id" value="yes" v-model="answersGroup2[idx]" />
            <label :for="'hyperactivity-yes-' + q.id">Yes</label>
            <input type="radio" :id="'hyperactivity-no-' + q.id" :name="'hyperactivity-' + q.id" value="no" v-model="answersGroup2[idx]" />
            <label :for="'hyperactivity-no-' + q.id">No</label>
          </div>
        </div>
        <button type="submit">Submit</button>
        <div v-if="error" class="error-message">Please answer all questions before submitting.</div>
      </form>
      <div v-if="showResult" class="grading-result">
        <h3>Screening Result</h3>
        <ul>
          <li><strong>Inattention:</strong> {{ inattentionYes }} Yes</li>
          <li><strong>Hyperactivity/Impulsivity:</strong> {{ hyperYes }} Yes</li>
          <li><strong>Total Yes:</strong> {{ totalYes }}</li>
        </ul>
        <div v-if="isAdult">
          <div v-if="inattentionYes >= 4">Positive Inattention Screening (Adult)</div>
          <div v-if="hyperYes >= 4">Positive Hyperactive/Impulsive Screening (Adult)</div>
          <div v-if="totalYes >= 7">Overall ADHD Likelihood (Adult): Top 5–7% symptom frequency</div>
          <div v-if="inattentionYes < 4 && hyperYes < 4 && totalYes < 7">Screening below threshold for ADHD likelihood (Adult)</div>
        </div>
        <div v-else>
          <div v-if="inattentionYes >= 6">Positive Inattention Screening (Child)</div>
          <div v-if="hyperYes >= 6">Positive Hyperactive/Impulsive Screening (Child)</div>
          <div v-if="inattentionYes >= 6 || hyperYes >= 6">Overall ADHD Likelihood (Child): Meets category threshold</div>
          <div v-if="inattentionYes < 6 && hyperYes < 6">Screening below threshold for ADHD likelihood (Child)</div>
        </div>
        <p class="note">Meeting or exceeding the symptom count threshold does not constitute a diagnosis. A positive screen increases the likelihood of ADHD and indicates the need for professional evaluation.</p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';

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
const error = ref(false);
const isAdult = ref(true); // true = >16 years old
const showResult = ref(false);

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
}
</script>

<style scoped>
  .question-block {
    margin-bottom: 1.5em;
  }
  label {
    font-weight: 500;
    margin-right: 1em;
  }
  input[type="radio"] {
    margin: 0 0.5em 0 1em;
  }
  button[type="submit"] {
    margin-top: 2em;
    padding: 0.5em 2em;
    font-size: 1.1em;
    background: #4f8cff;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  button[type="submit"]:hover {
    background: #357ae8;
  }
  .error-message {
    color: #d8000c;
    background: #ffd2d2;
    border: 1px solid #d8000c;
    padding: 0.5em 1em;
    margin-top: 1em;
    border-radius: 4px;
    font-weight: 500;
    display: inline-block;
  }
  .age-selector {
    margin-bottom: 2em;
  }
  .grading-result {
    margin-top: 2em;
    padding: 1em;
    background: #f6f8fa;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
  }
  .grading-result ul {
    margin-bottom: 1em;
  }
  .grading-result li {
    margin-bottom: 0.5em;
  }
  .note {
    font-size: 0.95em;
    color: #555;
    margin-top: 1em;
  }
</style>