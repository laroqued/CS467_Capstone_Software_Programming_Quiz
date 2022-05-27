countdownTimer = (totalTime=10) => {

    if (totalTime == 0) {
        document.getElementById('submitQuiz').click();
    }

    let hours = Math.floor(totalTime / 60 / 60);
    let minutes = Math.floor(totalTime / 60 % 60);
    let seconds = totalTime % 60 % 60;

    let timeLeft = (hours < 10 ? "0" + hours : hours) + ":" + 
                   (minutes < 10 ? "0" + minutes : minutes) + ":" +
                   (seconds < 10 ? "0" + seconds : seconds);

    document.getElementById('timer').innerHTML = timeLeft;

    setTimeout(() => {
        countdownTimer(totalTime-1);
    }, 1000);

}

countdownTimer();
