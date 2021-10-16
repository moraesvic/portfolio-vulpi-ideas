const validateTest = function (uname,pwd,pwdRepeat){
    /* just for tests */
    var returnValue = 
    {
        status: true,
        message: ''
    }
    return returnValue;
}

const validate = function (uname,pwd,pwdRepeat){
    var returnValue = 
    {
        status: false,
        message: ''
    }
    
    if(uname.length < 6 || uname.length > 12)
    {
        returnValue.message = 'Your username must have<br>between 6 and 12 characters';
        return returnValue;
    }

    const acceptedChars = /^[a-z0-9]+$/;
    
    if(!uname.match(acceptedChars))
    {
        returnValue.message = 'Username contains invalid characters.<br>Please, only numbers and lower case letters.';
        return returnValue;
    }

    if(pwd !== pwdRepeat)
    {
        returnValue.message = "Confirmation doesn't match password";
        return returnValue;
    }

    if(pwd.length < 8)
    {
        returnValue.message = "Password must contain at least 8 characters";
        return returnValue;
    }

    if(! (pwd.match(/[a-z]/) && pwd.match(/[A-Z]/) && pwd.match(/[0-9]/)) )
    {
        returnValue.message = "Password must contain lower case,<br>upper case and numbers.";
        return returnValue;
    }

    returnValue.status = true;
    return returnValue;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = validate;
}