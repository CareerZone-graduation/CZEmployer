import React from 'react';
import TalentPoolTab from '@/components/company/talent-pool/TalentPoolTab';

const TalentPoolPage = () => {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Talent Pool</h1>
                <p className="text-muted-foreground">Quản lý và theo dõi các ứng viên tiềm năng</p>
            </div>
            <TalentPoolTab />
        </div>
    );
};

export default TalentPoolPage;
