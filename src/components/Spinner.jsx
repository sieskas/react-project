import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

const Spinner = ({ size = 24, className, ...props }) => {
    return (
        <Loader2
            width={size}
            height={size}
            className={clsx('animate-spin text-primary', className)}
            {...props}
        />
    );
};

export default Spinner;
