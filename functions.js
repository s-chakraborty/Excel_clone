//Address = A1 J3 T12 (Means address name)
function getRowIdColIdFromAddress(address){
    let colId = address.charCodeAt(0)-65;
    let rowId = Number(address.substring(1))-1;
    return {
        rowId,
        colId
    }
}


//Get row and column by event target
function getRowAndColId(e)
{
    let rowId=Number(e.target.getAttribute("rowid"));
    let colId=Number(e.target.getAttribute("colid"));
    return{
        rowId,
        colId
    }
}


//Formula C1 = (A1 + B2 - 3 ) Means A1 and B2 are 'parents' of C1
/*-------- C1 is selfCellObject in which forumla is applied means 'child'------------------*/
function solveFormula(formula,selfCellObject)
{
        let formulaArr=formula.split(" ");//Split formula on the basis of space and make formulaArray
        
        for(let i=0;i<formulaArr.length;i++)
        {
            let formulaComponent=formulaArr[i];//Every component of formulaArray like A1 B12 G3 etc.
            
            if(formulaComponent[0]>="A" && formulaComponent[0]<="Z")//If character is lie between A to Z
            {
                
                let {rowId,colId} = getRowIdColIdFromAddress(formulaComponent); //Find row&col id by address like A1 B32 E32 etc.
                let cellObject = db[rowId][colId];//Find that cell Object
                let value = cellObject.value;//Get Object value like "A1 contains 23" and "B3 contains 3"
            
                //If self object is present the push new children 
                if(selfCellObject)
                {
                    // Update child in every parent element Like in A1.children we push C1 and B2.children we push C1
                    cellObject.children.push(selfCellObject.name); 
    
                    // Update parent in this selfCellObject C1.parent we push A1 and then B2
                    selfCellObject.parent.push(cellObject.name); 
                }
                 
                formula = formula.replace(formulaComponent,value);
                // console.log( cellObject);
    

            }
        }
        let computedValue=eval(formula); //Calculate value by evaluate function
        return computedValue;

}
    


//Update all child elements recursively,If we pass cellObject of A1 then it is finding all It's children like C1 or G2 and make changes in their values also if we change A1 value
function updateChildren(cellObject) 
{
    for(let i=0;i<cellObject.children.length;i++)
    {
        let childName= cellObject.children[i];//Get child name like C1 
        let {rowId,colId}= getRowIdColIdFromAddress(childName);
        let childCellObject= db[rowId][colId];//find C1 object
         
        //Update child object new value
        let newValue=solveFormula(childCellObject.formula);//We don't pass selfCellObject for update formula in it's child
        childCellObject.value=newValue;
        
        //Also make changes on website ui
        let cellUi= document.querySelector(`div[rowid='${rowId}'][colid='${colId}']`);
        cellUi.textContent=newValue;
        console.log("Changes applied on"+childName);


        //Update current childObject childrens values also 
        if(childCellObject.children.length!=0) //If childObject children array length is more than 0
        {
            console.log("Children recursive is"+ childCellObject.children);
            updateChildren(childCellObject);
        }
    }
    
}


//Remove all formula from every child and parent element C1{parent:[A1,D3]}
function removeFormula(cellObject){ 
    for(let i=0;i<cellObject.parent.length;i++)
    {
        let parentName=cellObject.parent[i]; //Select every parent in loop like A1 and D3
        let {rowId,colId}=getRowIdColIdFromAddress(parentName);
        let parentObject=db[rowId][colId]; //Select parent object like A1 object {children:[C1,E4,G6]}
        
        //Filter children without curr object name
        let updatedChildren=parentObject.children.filter(function(child){ //Pass C1,E4,G6 in child one by one
            return child!=cellObject.name; //( CellObject Name == C1 ) UpdatedChildren would be [E4, G6] 
        })

        parentObject.children=updatedChildren; // Update Old children array with new Updated children array
    }
    cellObject.parent=[]; // Current object all parents remove C1{ parent:[] }
}






function sheetEventListener(sheet)
{
    sheet.addEventListener("click",function(){
        if(sheet.classList.contains("active-sheet"))
        {
            return;
        }
        clearUi();

        //Remove active status from last selected sheet
        let activeSheet=document.querySelector(".active-sheet");
        activeSheet.classList.remove("active-sheet");
        //Add active on new sheet
        sheet.classList.add("active-sheet");
        
        let sheetId=sheet.getAttribute("sheetid");

        db=allSheetsDb[sheetId].db; //Select db of sheetDb[index] Eg:- db = allSheetDb[2] means 3rd sheet db address pass
        visitedCells=allSheetsDb[sheetId].visitedCells; //Select visitedCells of sheetDb[index]
        
        setUiValue(); //Set value of selected db in Website Ui
    })
}


function clearUi()
{
    for(let i=0;i<100;i++)
    {
        for(let j=0;j<26;j++)
        {
            let cell=document.querySelector(`div[rowid="${i}"][colid="${j}"]`);
            cell.innerHTML="";
            cell.style.background="#ffffff";
        }
    }
}


function setUiValue()
{
    for(let i=0;i<visitedCells.length;i++)
    {
        let {rowId,colId}=visitedCells[i];
        let cellObject=db[rowId][colId];
        let cell=document.querySelector(`div[rowid="${rowId}"][colid="${colId}"]`);
        cell.innerHTML=cellObject.value;
        cell.style.background=cellObject.bgColor;
    
    }
}


function setFontStyle(styleName,iconElement)
{   

    if(lastSelectedCell) //If any cell selected already then that is our lastSelected cell
    {


        let {rowId,colId}=getRowAndColId(lastSelectedCell);
        let cellObject= db[rowId][colId];  


        //Change in font family


        if(styleName=="roboto")
        {
            lastSelectedCell.target.style.fontFamily="Roboto,RobotoDraft,Helvetica,Arial,sans-serif";

            cellObject.fontFamily.roboto=true;
            cellObject.fontFamily.arial=false; 
            cellObject.fontFamily.rockwell=false; 
            cellObject.fontFamily.monospace=false;
            
            let option=document.querySelector("option[selected]")
            option.removeAttribute("selected");
            roboto.setAttribute("selected","");
            return;

        }else if(styleName=="arial")
        {
            lastSelectedCell.target.style.fontFamily="Georgia, 'Times New Roman', Times, serif";

            cellObject.fontFamily.arial=true; 
            cellObject.fontFamily.roboto=false;
            cellObject.fontFamily.rockwell=false; 
            cellObject.fontFamily.monospace=false;
            
            let option=document.querySelector("option[selected]")
            option.removeAttribute("selected");
            arial.setAttribute("selected","");
            return;
            
        }else if(styleName=="rockwell")
        {
            lastSelectedCell.target.style.fontFamily="Rockwell";

            cellObject.fontFamily.rockwell=true; 
            cellObject.fontFamily.arial=false; 
            cellObject.fontFamily.roboto=false;
            cellObject.fontFamily.monospace=false;
            
            let option=document.querySelector("option[selected]");
            option.removeAttribute("selected");
            rockwell.setAttribute("selected","");

            return;
            
        }else if(styleName=="monospace")
        {
            lastSelectedCell.target.style.fontFamily="monospace";

            cellObject.fontFamily.monospace=true;
            cellObject.fontFamily.arial=false; 
            cellObject.fontFamily.roboto=false;
            cellObject.fontFamily.rockwell=false; 
            
            let option=document.querySelector("option[selected]")
            option.removeAttribute("selected");
            monospace.setAttribute("selected","");
            return;
        }




        // if left is align then make right and center object false and also remove active class from them and vice versa
        if(styleName=="leftAlign")
        {
            lastSelectedCell.target.style.textAlign="left";

            cellObject.alignStyle.leftAlign=true;
            cellObject.alignStyle.centerAlign=false;
            cellObject.alignStyle.rightAlign=false;

            leftAlignIcon.classList.add("active-font-style");
            centerAlignIcon.classList.remove("active-font-style");
            rightAlignIcon.classList.remove("active-font-style");
            return;

        }else if(styleName=="centerAlign")
        {
            lastSelectedCell.target.style.textAlign="center";
            cellObject.alignStyle.centerAlign=true;
            cellObject.alignStyle.leftAlign=false;
            cellObject.alignStyle.rightAlign=false;

            centerAlignIcon.classList.add("active-font-style");
            leftAlignIcon.classList.remove("active-font-style");
            rightAlignIcon.classList.remove("active-font-style");
            return;
            
        }else if(styleName=="rightAlign"){
            lastSelectedCell.target.style.textAlign="right";
            cellObject.alignStyle.rightAlign=true;
            cellObject.alignStyle.leftAlign=false;
            cellObject.alignStyle.centerAlign=false;

            rightAlignIcon.classList.add("active-font-style");
            centerAlignIcon.classList.remove("active-font-style");
            leftAlignIcon.classList.remove("active-font-style");
            return;
        }


        //------------Check for background color
        if(styleName=="bgColor"){
            cellObject.bgColor=iconElement.value;//Change in object value
            lastSelectedCell.target.style.background=iconElement.value;//Change in ui
            return;
        }
        
        //------------Check for Text color
        if(styleName=="textColor"){
            cellObject.textColor=iconElement.value;//Change in object value
            lastSelectedCell.target.style.color=iconElement.value;//Change in ui
            return;
        }
        
                

        
        //If syleName is bold ,It will check for cellObject.fontStyle.bold is true means you are click again
        if(cellObject.fontStyle[styleName])
        {

            if(styleName=="bold")
            {
                lastSelectedCell.target.style.fontWeight="normal";
            }else if(styleName=="italic")
            {
                lastSelectedCell.target.style.fontStyle="normal";
            }else if(styleName=="underline"){
                lastSelectedCell.target.style.textDecoration="none";
            }

            iconElement.classList.remove("active-font-style");

        }else{ 
            //If bold is false it means Now I made is true
            if(styleName=="bold")
            {
                lastSelectedCell.target.style.fontWeight="bold";
                iconElement.classList.add("active-font-style");
                
            }else if(styleName=="italic")
            {
                lastSelectedCell.target.style.fontStyle="italic";
                iconElement.classList.add("active-font-style");
            }else if(styleName=="underline"){
                lastSelectedCell.target.style.textDecoration="underline"; 
                iconElement.classList.add("active-font-style");  
            }


        }
        //If bold is true before it make false
        cellObject.fontStyle[styleName] =!cellObject.fontStyle[styleName]; 




        //Check for border style
        if(cellObject.borderStyle[styleName])
        {

            if(styleName=="top")
            {
                lastSelectedCell.target.style.borderTop=null;
            }else if(styleName=="right")
            {
                lastSelectedCell.target.style.borderRight=null;
            }else if(styleName=="bottom"){
                lastSelectedCell.target.style.borderBottom=null;
            }
            else if(styleName=="left"){
                lastSelectedCell.target.style.borderLeft=null;
            }
            else if(styleName=="outer"){
                lastSelectedCell.target.style.border=null;
            
            }
            
        

            iconElement.classList.remove("active-font-style");

        }else{ 
            if(styleName=="top")
            {
                lastSelectedCell.target.style.borderTop="1.5px solid black";

            }else if(styleName=="right")
            {
                lastSelectedCell.target.style.borderRight="1.5px solid black";

            }else if(styleName=="bottom"){
                lastSelectedCell.target.style.borderBottom="1.5px solid black";
            }
            else if(styleName=="left"){
                lastSelectedCell.target.style.borderLeft="1.5px solid black";
            }
            else if(styleName=="outer"){
                lastSelectedCell.target.style.border="1.5px solid black";
            } 
            iconElement.classList.add("active-font-style");
        }
        cellObject.borderStyle[styleName] =!cellObject.borderStyle[styleName]; 



    }
}

function checkForIconStyle(cellObject)
{

        /*----------Check for Icons-------------------*/
        let boldIcon=document.querySelector(".bold");
        let italicIcon=document.querySelector(".italic");
        let underlineIcon=document.querySelector(".underline");
        
        if(cellObject.fontStyle.bold)//If bold is true
        {
            boldIcon.classList.add("active-font-style"); //If true then we have to change bg-color it on ui
        }else{
            boldIcon.classList.remove("active-font-style");//If false then remove bg-color on ui
        }


        if(cellObject.fontStyle.italic)//If italic is true
        {
            italicIcon.classList.add("active-font-style"); //If true then we have to change bg-color it on Ui
        }else{
            italicIcon.classList.remove("active-font-style");//If false then remove bg-color on Ui
        }


        if(cellObject.fontStyle.underline)//If underline is true
        {
            underlineIcon.classList.add("active-font-style"); //If underline is true then we have to change bg-color it on ui
        }else{
            underlineIcon.classList.remove("active-font-style");//If false then remove bg-color on ui
        }









        /*----------Check for Background Icon-------------------*/


        let bgColorIcon=document.querySelector("input[id='bg-color']");
        if(cellObject.bgColor!="#ffffff")//If color is not white
        {
            //we have to change bg-color it on ui
            bgColorIcon.value=cellObject.bgColor; 
        }else{
            // remove bg-color on ui
            bgColorIcon.value="#ffffff"; 
        }


        /*----------Check for Text color Icon-------------------*/

        let textColorIcon=document.querySelector("input[id='text-color']");
        if(cellObject.textColor!="#000000")//If color is not black
        {
            //we have to change text-color it on ui
            textColorIcon.value=cellObject.textColor; 
        }else{
            //remove text-color on ui
            textColorIcon.value="#000000"; 
        }
        



        /*----------Check for Border Icon-------------------*/

        let topBorderIcon=document.querySelector(".top-border");
        if(cellObject.borderStyle.top)//If italic is true
        {
            topBorderIcon.classList.add("active-font-style"); //If true then we have to change bg-color it on Ui
        }else{
            topBorderIcon.classList.remove("active-font-style");//If false then remove bg-color on Ui
        }

        let rightBorderIcon=document.querySelector(".right-border");
        if(cellObject.borderStyle.right)//If italic is true
        {
            rightBorderIcon.classList.add("active-font-style"); //If true then we have to change bg-color it on Ui
        }else{
            rightBorderIcon.classList.remove("active-font-style");//If false then remove bg-color on Ui
        }


        let bottomBorderIcon=document.querySelector(".bottom-border");
        if(cellObject.borderStyle.bottom)//If underline is true
        {
            bottomBorderIcon.classList.add("active-font-style"); //If underline is true then we have to change bg-color it on ui
        }else{
            bottomBorderIcon.classList.remove("active-font-style");//If false then remove bg-color on ui
        }


        let leftBorderIcon=document.querySelector(".left-border");
        if(cellObject.borderStyle.left)//If underline is true
        {
            leftBorderIcon.classList.add("active-font-style"); //If underline is true then we have to change bg-color it on ui
        }else{
            leftBorderIcon.classList.remove("active-font-style");//If false then remove bg-color on ui
        }

        let outerBorderIcon=document.querySelector(".outer-border");
        if(cellObject.borderStyle.outer)//If underline is true
        {
            outerBorderIcon.classList.add("active-font-style"); //If underline is true then we have to change bg-color it on ui
        }else{
            outerBorderIcon.classList.remove("active-font-style");//If false then remove bg-color on ui
        }





        /*----------Check for Align Icon-------------------*/  


        let leftAlignIcon=document.querySelector(".left-side");
        if(cellObject.alignStyle.leftAlign)//If underline is true
        {
            leftAlignIcon.classList.add("active-font-style"); //If underline is true then we have to change bg-color it on ui
        }else{
            leftAlignIcon.classList.remove("active-font-style");//If false then remove bg-color on ui
        }


        let centerAlignIcon=document.querySelector(".center-side");
        if(cellObject.alignStyle.centerAlign)//If underline is true
        {
            centerAlignIcon.classList.add("active-font-style"); //If underline is true then we have to change bg-color it on ui
        }else{
            centerAlignIcon.classList.remove("active-font-style");//If false then remove bg-color on ui
        }


        let rightAlignIcon=document.querySelector(".right-side");
        if(cellObject.alignStyle.rightAlign)//If underline is true
        {
            rightAlignIcon.classList.add("active-font-style"); //If underline is true then we have to change bg-color it on ui
        }else{
            rightAlignIcon.classList.remove("active-font-style");//If false then remove bg-color on ui
        }



        /*----------Check for Font Family Icon-------------------*/  


        let roboto=document.querySelector("option[value='roboto']");
        if(cellObject.fontFamily.roboto)
        {
            roboto.setAttribute("selected","");
            select.selectedIndex = 0;
        }else{
            roboto.removeAttribute("selected");   
        }

        let arial=document.querySelector("option[value='arial']");
        if(cellObject.fontFamily.arial)
        {
            arial.setAttribute("selected","");
            select.selectedIndex = 1;
        }else{
            arial.removeAttribute("selected");   
        }

        let rockwell=document.querySelector("option[value='rockwell']");
        if(cellObject.fontFamily.rockwell)
        {
            rockwell.setAttribute("selected","");
            select.selectedIndex = 2;
        }else{
            rockwell.removeAttribute("selected");   
        }

        let monospace=document.querySelector("option[value='monospace']");
        if(cellObject.fontFamily.monospace)
        {
            monospace.setAttribute("selected","");
            select.selectedIndex = 3;
        }else{
            monospace.removeAttribute("selected");   
        }



} 