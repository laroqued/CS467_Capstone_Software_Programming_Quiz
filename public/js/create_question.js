
a1_swap = (event) => {
    let item = document.getElementById('a1');
    let input = document.getElementById('input1');

    if (item.classList.contains('btn-success')) {
        item.classList.remove('btn-success');
        item.classList.add('btn-danger');
    } else {
        item.classList.remove('btn-danger');
        item.classList.add('btn-success');
    }
    
    if (input.name == "answer1") {
        input.name = "option1";
    } else {
        input.name = "answer1";
    }

    if (item.innerHTML == "Correct") {
        item.innerHTML = "Incorrect";
    } else {
        item.innerHTML = "Correct";
    }

    event.preventDefault();
}

a2_swap = (event) => {
    let item = document.getElementById('a2');
    let input = document.getElementById('input2');

    if (item.classList.contains('btn-success')) {
        item.classList.remove('btn-success');
        item.classList.add('btn-danger');
    } else {
        item.classList.remove('btn-danger');
        item.classList.add('btn-success');
    }
    
    if (input.name == "answer2") {
        input.name = "option2";
    } else {
        input.name = "answer2";
    }

    if (item.innerHTML == "Correct") {
        item.innerHTML = "Incorrect";
    } else {
        item.innerHTML = "Correct";
    }

    
    event.preventDefault();
}

a3_swap = (event) => {
    let item = document.getElementById('a3');
    let input = document.getElementById('input3');

    if (item.classList.contains('btn-success')) {
        item.classList.remove('btn-success');
        item.classList.add('btn-danger');
    } else {
        item.classList.remove('btn-danger');
        item.classList.add('btn-success');
    }
    
    if (input.name == "answer3") {
        input.name = "option3";
    } else {
        input.name = "answer3";
    }

    if (item.innerHTML == "Correct") {
        item.innerHTML = "Incorrect";
    } else {
        item.innerHTML = "Correct";
    }

    
    event.preventDefault();
}

a4_swap = (event) => {
    let item = document.getElementById('a4');
    let input = document.getElementById('input4');

    if (item.classList.contains('btn-success')) {
        item.classList.remove('btn-success');
        item.classList.add('btn-danger');
    } else {
        item.classList.remove('btn-danger');
        item.classList.add('btn-success');
    }
    
    if (input.name == "answer4") {
        input.name = "option4";
    } else {
        input.name = "answer4";
    }
    
    if (item.innerHTML == "Correct") {
        item.innerHTML = "Incorrect";
    } else {
        item.innerHTML = "Correct";
    }


    event.preventDefault();
}

bindButtons = () => {
    document.getElementById('a1').addEventListener('click', a1_swap);
    document.getElementById('a2').addEventListener('click', a2_swap);
    document.getElementById('a3').addEventListener('click', a3_swap);
    document.getElementById('a4').addEventListener('click', a4_swap);
}

bindButtons();