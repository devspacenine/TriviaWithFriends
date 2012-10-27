module.exports = {
    /*****************************************************************************
    * Difficulty Validator
    *-----------------------------------------------------------------------------
    *
    * Validates that a difficulty number is greater than 0 and less than 6.
    *
    *****************************************************************************/
    Difficulty: function(val) {
        if(val < 1 || val > 6) {
            return false;
        }
        return true;
    },
    
    /*****************************************************************************
    * Phone Number Validator
    *-----------------------------------------------------------------------------
    *
    * Validates that a phone number has at least an area code and 7 following
    * it. The numbers can be separated by either ".", "-", spaces or not
    * separated at all. It also allows a country code in the same manner and
    * with or without a "+".
    *
    *****************************************************************************/
    PhoneNumber: function(val) {
        val = val.compact();
        var phoneNumberRegex = /^(?:\+?([0-9]{1,3})[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)([0-9]{3})[-. ]?([0-9]{4})$/;
        if(phoneNumberRegex.test(val)) {
            return true;
        }
        return false;
    },

    /*****************************************************************************
    * IP Address Validator
    *-----------------------------------------------------------------------------
    *
    * Regex that validates an IPv4 address.
    * 
    *****************************************************************************/
    IPAddress: /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/,

    /*****************************************************************************
    * Max Length Validator
    *-----------------------------------------------------------------------------
    *
    * Validates that the length of a string is no longer than the set value.
    *
    *****************************************************************************/
    Max: function(len) {
        return function(val) {
            if(val.length > len) return false;
            return true;
        };
    }
};
