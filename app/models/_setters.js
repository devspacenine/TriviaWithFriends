module.exports = {
    /*****************************************************************************
    * Phone Number Setter
    *-----------------------------------------------------------------------------
    *
    * A setter that converts a phone number to the format "+1 (555) 555-5555".
    *
    *****************************************************************************/
    PhoneNumber: function(val) {
        // Remove extra whitespace
        val = val.compact();
        var phoneNumberRegex = /^(?:\+?([0-9]{1,3})[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)([0-9]{3})[-. ]?([0-9]{4})$/;
        if(phoneNumberRegex.test(val)) {
            var parts = val.match(phoneNumberRegex),
            final = '';
            if(parts[1]) {
                final += '+' + parts[1] + ' ';
            }
            final += '(' + parts[2] + ') ' + parts[3] + '-' + parts[4];
            return final;
        }
        return val;
    },

    /*****************************************************************************
    * Compact Setter
    *-----------------------------------------------------------------------------
    *
    * A setter that reduces all whitespace in a string to single spaces and trims
    * it.
    *
    *****************************************************************************/
    Compact: function(val) {
        return val.compact();
    },

    /*****************************************************************************
    * Compact Lower Setter
    *-----------------------------------------------------------------------------
    *
    * A setter that reduces all whitespace in a string to single spaces, trims it
    * and converts it to lowercase.
    *
    *****************************************************************************/
    CompactLower: function(val) {
        return val.toLowerCase().compact();
    }
};
