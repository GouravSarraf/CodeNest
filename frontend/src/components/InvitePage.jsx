import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyInvite } from '../api/invite';
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';

const InvitePage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const { inviteId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const verifyInviteFunction = async () => {
            try {
                const response = await verifyInvite(inviteId);
                setSuccess(response.success);
                setIsLoading(false);
            } catch (error) {
                setError(error.message);
                setIsLoading(false);
            }
        };
        verifyInviteFunction();
    }, [inviteId]);

    const handleBackToProjects = () => {
        navigate('/projects');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#EAEFEF]/5 dark:bg-[#5A827E]/5 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5A827E] mx-auto mb-4"></div>
                    <p className="text-[#333446] dark:text-[#B8CFCE]">Verifying invite...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#EAEFEF]/5 dark:bg-[#5A827E]/5 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-[#333446] rounded-2xl shadow-lg p-6 sm:p-8 border border-[#B8CFCE]/30 dark:border-[#7F8CAA]/30">
                    <div className="text-center">
                        <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-[#333446] dark:text-[#B8CFCE] mb-2">Invalid Invite</h2>
                        <p className="text-[#7F8CAA] mb-6">{error}</p>
                        <button
                            onClick={handleBackToProjects}
                            className="inline-flex items-center px-4 py-2 bg-[#333446] hover:bg-[#7F8CAA] text-[#EAEFEF] rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Projects
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-[#EAEFEF]/5 dark:bg-[#5A827E]/5 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-[#333446] rounded-2xl shadow-lg p-6 sm:p-8 border border-[#B8CFCE]/30 dark:border-[#7F8CAA]/30">
                    <div className="text-center">
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-[#333446] dark:text-[#B8CFCE] mb-2">Invite Verified</h2>
                        <p className="text-[#7F8CAA] mb-6">You have successfully joined the project!</p>
                        <button
                            onClick={handleBackToProjects}
                            className="inline-flex items-center px-4 py-2 bg-[#333446] hover:bg-[#7F8CAA] text-[#EAEFEF] rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Projects
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#EAEFEF]/5 dark:bg-[#5A827E]/5 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-[#333446] rounded-2xl shadow-lg p-6 sm:p-8 border border-[#B8CFCE]/30 dark:border-[#7F8CAA]/30">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-[#333446] dark:text-[#B8CFCE] mb-4">Project Invite</h1>
                    <p className="text-[#7F8CAA] mb-6">Verifying your invite...</p>
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5A827E] mx-auto"></div>
                </div>
            </div>
        </div>
    );
};

export default InvitePage;