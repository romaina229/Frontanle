import { useSelector } from 'react-redux';
import { selectAuthLoading } from '@/store/slices/authSlice';

const UseLoading = () =>{
    const loading = useSelector(selectAuthLoading);

    const withLoading = async (asyncFn: () => Promise<any>) => {
        if (loading) {
            return { loading: true};
        }
        try {
            const result = await asyncFn();
            return { loading: false, result };
        } catch (error) {
            return { loading: false, error };
        }
    };

    return {loading, withLoading };
    
};