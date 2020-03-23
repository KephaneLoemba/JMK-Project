// global variables 
    // added by Mila


    //added by John


    //added by Kephane




//js code by Mila
    function createToDocontainer(){
        let toDoContainer = document.createElement("div");
        toDoContainer.className="uk-card uk-card-default uk-card-body uk-padding-small uk-card-hover uk-position-relative uk-margin-small";
        let content =  '<input type="checkbox" class="a uk-inline uk-text-large">'
                        +'<p class="uk-inline uk-margin-remove display-event-time"> 9AM - 10AM : </p>'
                        +'<p class=" uk-inline uk-margin-remove display-event-title"> ohhha </p>'
                        +'<ul class="uk-iconnav uk-position-top-right uk-position-small">'
                            +'<li><a href="#" uk-icon="icon: file-edit"></a></li>'
                            +'<li><a href="#" uk-icon="icon: trash"></a></li></ul>';
        toDoContainer.innerHTML = content;
        console.log(toDoContainer);
        document.querySelector("#to-do-list").appendChild(toDoContainer);
    }
    createToDocontainer();


    function moveToFinishedList(){
        let conatiner= element.target;
        conatiner.removeChild(container.childNodes[0])
        conatiner.childNodes[3].innerHTML='<li><a href="#" uk-icon="icon: refresh" uk-tooltip="title: Restore; pos: bottom"></a></li>'
        document.querySelector("#finished-list").appendChild(container);
    }




