let cellContainer=document.querySelector(".cell-container>.cell-inner");//Container 
let addressInput=document.querySelector("#address");//address bar
let formulaBar=document.querySelector("#formula");//formula bar

let sheetList=document.querySelector(".sheets-list");//All sheet-list div

let sheetOne=document.querySelector(".sheets-list>.sheet");
sheetEventListener(sheetOne);//Add event in first sheet 

let addSheetBtn=document.querySelector(".add-sheet");

let lastSelectedCell;

/*--------------------Set event listener on menu icons------------------------ */

let bold=document.querySelector(".bold");
let italic=document.querySelector(".italic");
let underline=document.querySelector(".underline");

let roboto=document.querySelector("option[value='roboto']");
let arial=document.querySelector("option[value='arial']");
let rockwell=document.querySelector("option[value='rockwell']");
let monospace=document.querySelector("option[value='monospace']");



let leftAlignIcon=document.querySelector(".left-side");
let centerAlignIcon=document.querySelector(".center-side");
let rightAlignIcon=document.querySelector(".right-side");

let bgColorIcon=document.querySelector("input[id='bg-color']");
let textColorIcon=document.querySelector("input[id='text-color']");

let topIcon=document.querySelector(".top-border");
let rightIcon=document.querySelector(".right-border");
let bottomIcon=document.querySelector(".bottom-border");
let leftIcon=document.querySelector(".left-border");
let outerIcon=document.querySelector(".outer-border");

let select=document.querySelector("#fontStyleSelect");


select.addEventListener("change",function()
{
    setFontStyle(select.value,select.value);
})


bold.addEventListener("click",function()
{
    setFontStyle("bold",bold);
})

italic.addEventListener("click",function()
{
    setFontStyle("italic",italic);
})

underline.addEventListener("click",function()
{
    setFontStyle("underline",underline);
})

bgColorIcon.addEventListener("blur",function(){
    setFontStyle("bgColor",bgColorIcon);
})

textColorIcon.addEventListener("blur",function(){
    setFontStyle("textColor",textColorIcon);
})


topIcon.addEventListener("click",function()
{
    setFontStyle("top",topIcon);
})

rightIcon.addEventListener("click",function()
{
    setFontStyle("right",rightIcon);
})

bottomIcon.addEventListener("click",function()
{
    setFontStyle("bottom",bottomIcon);
})

leftIcon.addEventListener("click",function()
{
    setFontStyle("left",leftIcon);
})

outerIcon.addEventListener("click",function()
{
    setFontStyle("outer",outerIcon);
})


leftAlignIcon.addEventListener("click",function()
{
    setFontStyle("leftAlign",leftAlignIcon);
})

centerAlignIcon.addEventListener("click",function()
{
    setFontStyle("centerAlign",centerAlignIcon);
})

rightAlignIcon.addEventListener("click",function()
{
    setFontStyle("rightAlign",rightAlignIcon);
})


/*--------------Make 2600 cell by DOM------------------------*/

function cellsInit()
{
    let cell="";

    cell+="<div class='alphabet-container'>";
    cell+=`<div class="alpha-cells"></div>`;
    for(let i=0;i<26;i++)
    {
        cell+=`<div class="alpha-cells" no="${i}"><p>${String.fromCharCode(65+i)}</p></div>`;
    }


    cell+="</div>";

    for(let i=0;i<100;i++)
    {
        cell+="<div class='cell-row'>"
        cell+=`<div class='number-cell' no="${i}"><p>${i+1}</p></div>`;
        for(let j=0;j<26;j++)
        {
            // cell
            cell+=`<div class='cell' rowid='${i}' colid='${j}' contentEditable></div>`;
        }
        cell+="</div>";
    }

    cellContainer.innerHTML=cell;
    

}

cellsInit();



//----------Initialization database array of every cell object-----------------------


let allSheetsDb=[];
let db;
let visitedCells;
function databaseInit()
{
    let newDb=[];
    for(let i=0;i<100;i++)
    {
        let row=[];
        for(let j=0;j<26;j++)
        {
            let cellObj={
                name: String.fromCharCode(65+j) + (i+1),
                value:"",
                formula:"",
                children:[],
                parent:[],
                visited:false,
                bgColor:"#ffffff",
                textColor:"#000000",
                fontStyle:{
                    bold:false,
                    italic:false,
                    underline:false
                },borderStyle:{
                    top:false,
                    right:false,
                    bottom:false,
                    left:false,
                    outer:false
                },
                alignStyle:{
                    leftAlign:true,
                    centerAlign:false,
                    rightAlign:false
                },fontFamily:{
                    roboto:true,
                    arial:false,
                    rockwell:false,
                    monospace:false
                }

                
            }
            row.push(cellObj);
        }
        newDb.push(row);
    }
    db=newDb;//Make db 
    
    visitedCells=[]; //Make visited cell array in every database sheet[index]

    allSheetsDb.push({db:newDb,visitedCells:visitedCells});//Push db and visited array Objects in every sheet

    // console.log(allSheetsDb);
}

databaseInit();



//------Add event on every cell by loop [cell=2600]


let allCells=document.querySelectorAll(".cell");
for(let i=0;i<allCells.length;i++)
{
    //Event on cell of click
    allCells[i].addEventListener("click",function(e){

        //`Object destructing` after return object value from (function getRowAndColId)
        let{rowId,colId}=getRowAndColId(e);

        let address=String.fromCharCode(65+colId)+(rowId+1);
        addressInput.value=address;

        let cellObject=db[rowId][colId];

        //Show formula value
        formulaBar.value=cellObject.formula;
        

        //Border hover
        let activeCell=document.querySelector(".active-cell");
        if(activeCell)
        {
            activeCell.classList.remove("active-cell");
            
        }
        let cell=document.querySelector(`div[rowid="${rowId}"][colid="${colId}"]`); //Change in ui
        cell.classList.add("active-cell");
        
        
        //Row and column address highlight

        let activeCol=document.querySelectorAll(".active-address"); //Remove previous selected row and column
        if(activeCol)
        {
            for(let i=0;i<activeCol.length;i++)
            {
                activeCol[i].classList.remove("active-address");
            }
        }

        //Add to new alphabet column
        let alphaColumn=document.querySelector(`.alpha-cells[no="${colId}"]`); 
        alphaColumn.classList.add("active-address");
        
        //Add to new number
        let numberRow=document.querySelector(`.number-cell[no="${rowId}"]`);
        numberRow.classList.add("active-address");


        //--------Check for font-style
        checkForIconStyle(cellObject);
        

    })

    //Value update after blur event on every cell (total==2600)
    allCells[i].addEventListener("blur",function(e){
        let cellValue=e.target.textContent;

        lastSelectedCell=e; //Last selected cell details after blur event happen

        //`Object destructing` after return object value from (function getRowAndColId)
        let{rowId,colId}=getRowAndColId(e);
        
        let cellObject=db[rowId][colId];
        if(cellObject.value==cellValue)
        {  
            return; // If new written value in cell is same as already wrote value then `return`
        }

        //If user input new value in cell then update that value in cellObject alse
        cellObject.value=cellValue;

        //-----Update it's children when blur event happens because new value is entered
        updateChildren(cellObject); //If blur happens in A1 then update all It's children value as well

        //-----------If cell object visited is true already then return
        if(cellObject.visited)
        {
            return;
        }
        cellObject.visited=true;
        visitedCells.push({"rowId":rowId,"colId":colId});

    })


    //When user click Backspace on C1 which had already formula present then it deletes formula
    allCells[i].addEventListener("keydown",function(e){
        if(e.key=='Backspace')
        {
            let cell=e.target;
            let {rowId,colId}=getRowAndColId(e);
            let cellObject=db[rowId][colId];

            cellObject.value="";//Clear Object value
            cell.textContent=""; //Clear Ui

            if(cellObject.formula)//If formula exist
            {
                cellObject.formula=""; //Update db cell formula
                formulaBar.value=""; //Clear formula bar on Ui
                cell.textContent=""; //Cell content got full erase on 1 backspace

                //Remove Cell name(C1) from it's Parent's.children Like A1.children[B2,C1] remove C1 from there
                removeFormula(cellObject); 
            }

        }

    })


}


    //Event when we insert formula in formula bar
    formulaBar.addEventListener("blur",function(e){
        let formula=e.target.value; //Take value from formula bar

        if(formula)
        {
            let{rowId,colId}=getRowAndColId(lastSelectedCell);//Get row&col id of lastSelected cell

            //Find cell object of that last selected cell
            let cellObject=db[rowId][colId];

            //If already formula present means we are inserting new formula 
            if(cellObject.formula)
            {
                //Remove all previous child and parent name from curr object because new formula may contain new parent and child elements 
                removeFormula(cellObject); 
            }

            //Passing cell object in which formula is applied for parent children purpose
            let computedValue=solveFormula(formula,cellObject);
            
            cellObject.value=computedValue; //Update new compute value
            cellObject.formula=formula;//Update new formula

            lastSelectedCell.target.textContent= computedValue; //Change in Ui
            
            updateChildren(cellObject);

            
            //-----------If cell object visited is true already then return
            if(cellObject.visited)
            {
                return;
            }
            cellObject.visited=true;
            visitedCells.push({"rowId":rowId,"colId":colId});
            // console.log(visitedCells);
        }
    })




    let sheetId=0;
    addSheetBtn.addEventListener("click",function(){
        sheetId++;
        if(sheetId<=7)
        {

        //---------Remove active status from last selected sheet
        let activeSheet=document.querySelector(".active-sheet");
        activeSheet.classList.remove("active-sheet");


        //---------- Create new sheet div
        let sheetDiv=document.createElement("div");
        sheetDiv.classList.add("sheet");
        sheetDiv.classList.add("active-sheet");
        sheetDiv.setAttribute("sheetid",sheetId);
        
        sheetDiv.innerHTML=`<p>Sheet ${sheetId+1}</p>`;
        sheetList.append(sheetDiv);
        
        clearUi();
        databaseInit(); //create new db after click on new sheet    

        //------ Add event of toggle on every sheet we create
        sheetEventListener(sheetDiv);
            

        }
    })

