// 题目数据（将从JSON文件加载）
let questions = {
    '选择题': [],
    '填空题': [],
    '判断题': []
};

// 当前状态
let currentType = '选择题';
let currentIndex = 0;
let userAnswer = '';
let isAnswered = false;

// DOM元素
const typeButtons = document.querySelectorAll('.type-btn');
const questionType = document.getElementById('question-type');
const questionIndex = document.getElementById('question-index');
const questionContent = document.getElementById('question-content');
const optionsContainer = document.getElementById('options-container');
const fillInput = document.getElementById('fill-input');
const trueFalseContainer = document.getElementById('true-false-container');
const submitBtn = document.getElementById('submit-btn');
const feedback = document.getElementById('feedback');
const correctAnswer = document.getElementById('correct-answer');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const currentQuestionText = document.getElementById('current-question');
const totalQuestionsText = document.getElementById('total-questions');

// 初始化函数
function init() {
    // 加载题目数据
    loadQuestions();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 显示第一题
    displayQuestion();
}

// 加载题目数据
function loadQuestions() {
    // 使用fetch加载JSON文件
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            questions = data;
            // 更新题目总数显示
            updateTotalQuestions();
            // 重新显示当前题目
            displayQuestion();
        })
        .catch(error => {
            console.error('加载题目数据失败:', error);
            // 显示错误信息
            questionContent.textContent = '题目数据加载失败，请检查文件路径。';
        });
}

// 绑定事件监听器
function bindEventListeners() {
    // 题型选择按钮
    typeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 更新当前题型
            currentType = button.dataset.type;
            currentIndex = 0;
            isAnswered = false;
            
            // 更新按钮状态
            typeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // 更新题目总数显示
            updateTotalQuestions();
            
            // 显示当前题型的第一题
            displayQuestion();
        });
    });
    
    // 提交答案按钮
    submitBtn.addEventListener('click', () => {
        if (isAnswered) return;
        
        // 获取用户答案
        getUserAnswer();
        
        // 验证答案
        checkAnswer();
    });
    
    // 上一题按钮
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            isAnswered = false;
            displayQuestion();
        }
    });
    
    // 下一题按钮
    nextBtn.addEventListener('click', () => {
        if (currentIndex < questions[currentType].length - 1) {
            currentIndex++;
            isAnswered = false;
            displayQuestion();
        }
    });
}

// 更新题目总数显示
function updateTotalQuestions() {
    const total = questions[currentType].length;
    totalQuestionsText.textContent = `${total}题`;
}

// 显示当前题目
function displayQuestion() {
    const questionList = questions[currentType];
    
    if (currentIndex >= questionList.length) {
        questionContent.textContent = '没有更多题目了。';
        return;
    }
    
    const question = questionList[currentIndex];
    
    // 更新问题信息
    questionType.textContent = currentType;
    questionIndex.textContent = currentIndex + 1;
    currentQuestionText.textContent = `第${currentIndex + 1}题`;
    
    // 更新问题内容
    questionContent.innerHTML = question.question.replace(/\n/g, '<br>');
    
    // 隐藏所有题型的UI元素
    optionsContainer.style.display = 'none';
    fillInput.style.display = 'none';
    trueFalseContainer.style.display = 'none';
    
    // 清除之前的选择
    document.querySelectorAll('.option').forEach(option => {
        option.classList.remove('selected', 'correct', 'incorrect');
    });
    
    // 清除输入框
    fillInput.value = '';
    
    // 隐藏反馈和正确答案
    feedback.style.display = 'none';
    correctAnswer.style.display = 'none';
    
    // 根据题型显示对应的UI元素
    if (currentType === '选择题') {
        showOptions(question.options);
    } else if (currentType === '填空题') {
        showFillInput();
    } else if (currentType === '判断题') {
        showTrueFalseOptions();
    }
    
    // 更新提交按钮状态
    submitBtn.disabled = false;
    submitBtn.textContent = '提交答案';
    
    // 更新导航按钮状态
    updateNavigationButtons();
    
    // 重置已回答状态
    isAnswered = false;
}

// 显示选择题选项
function showOptions(options) {
    optionsContainer.innerHTML = '';
    
    options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.innerHTML = option.replace(/\n/g, '<br>');
        optionDiv.dataset.value = option[0]; // 提取选项字母
        
        // 添加点击事件监听器
        optionDiv.addEventListener('click', () => {
            if (isAnswered) return;
            
            // 移除其他选项的选择状态
            document.querySelectorAll('.option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // 添加当前选项的选择状态
            optionDiv.classList.add('selected');
            
            // 更新用户答案
            userAnswer = optionDiv.dataset.value;
        });
        
        optionsContainer.appendChild(optionDiv);
    });
    
    optionsContainer.style.display = 'block';
}

// 显示填空题输入框
function showFillInput() {
    fillInput.style.display = 'block';
    fillInput.focus();
    
    // 添加输入事件监听器
    fillInput.addEventListener('input', () => {
        userAnswer = fillInput.value.trim();
    });
}

// 显示判断题选项
function showTrueFalseOptions() {
    trueFalseContainer.style.display = 'block';
    
    // 添加点击事件监听器
    document.querySelectorAll('#true-false-container .option').forEach(option => {
        option.addEventListener('click', () => {
            if (isAnswered) return;
            
            // 移除其他选项的选择状态
            document.querySelectorAll('#true-false-container .option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // 添加当前选项的选择状态
            option.classList.add('selected');
            
            // 更新用户答案
            userAnswer = option.dataset.value;
        });
    });
}

// 获取用户答案
function getUserAnswer() {
    if (currentType === '选择题') {
        const selectedOption = document.querySelector('.option.selected');
        if (selectedOption) {
            userAnswer = selectedOption.dataset.value;
        } else {
            userAnswer = '';
        }
    } else if (currentType === '填空题') {
        userAnswer = fillInput.value.trim();
    } else if (currentType === '判断题') {
        const selectedOption = document.querySelector('#true-false-container .option.selected');
        if (selectedOption) {
            userAnswer = selectedOption.dataset.value;
        } else {
            userAnswer = '';
        }
    }
}

// 验证答案
function checkAnswer() {
    const question = questions[currentType][currentIndex];
    const correct = checkUserAnswer(question, userAnswer);
    
    // 显示反馈
    showFeedback(correct, question.answer);
    
    // 更新已回答状态
    isAnswered = true;
    
    // 更新提交按钮状态
    submitBtn.disabled = true;
    submitBtn.textContent = '已回答';
}

// 检查用户答案是否正确
function checkUserAnswer(question, userAnswer) {
    if (currentType === '选择题') {
        return userAnswer === question.answer;
    } else if (currentType === '填空题') {
        // 填空题答案可能有多种表述，使用简单匹配
        const normalizedUserAnswer = userAnswer.trim().toLowerCase();
        const normalizedCorrectAnswer = question.answer.trim().toLowerCase();
        return normalizedUserAnswer === normalizedCorrectAnswer;
    } else if (currentType === '判断题') {
        return userAnswer === question.answer;
    }
    return false;
}

// 显示反馈信息
function showFeedback(isCorrect, correctAnswerText) {
    feedback.style.display = 'block';
    
    if (isCorrect) {
        feedback.className = 'feedback correct';
        feedback.textContent = '回答正确！';
    } else {
        feedback.className = 'feedback incorrect';
        feedback.textContent = '回答错误！';
        
        // 显示正确答案
        correctAnswer.style.display = 'block';
        correctAnswer.innerHTML = `正确答案：${correctAnswerText}`;
        
        // 高亮正确选项（选择题和判断题）
        if (currentType === '选择题') {
            document.querySelectorAll('.option').forEach(option => {
                if (option.dataset.value === correctAnswerText) {
                    option.classList.add('correct');
                } else if (option.classList.contains('selected')) {
                    option.classList.add('incorrect');
                }
            });
        } else if (currentType === '判断题') {
            document.querySelectorAll('#true-false-container .option').forEach(option => {
                if (option.dataset.value === correctAnswerText) {
                    option.classList.add('correct');
                } else if (option.classList.contains('selected')) {
                    option.classList.add('incorrect');
                }
            });
        }
    }
    
    // 如果回答正确且不是最后一题，1秒后自动跳转到下一题
    if (isCorrect && currentIndex < questions[currentType].length - 1) {
        setTimeout(() => {
            currentIndex++;
            isAnswered = false;
            displayQuestion();
        }, 1000);
    }
}

// 更新导航按钮状态
function updateNavigationButtons() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === questions[currentType].length - 1;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
