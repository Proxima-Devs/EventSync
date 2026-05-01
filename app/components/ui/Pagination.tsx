import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft, faArrowRight} from "@fortawesome/free-solid-svg-icons";

type PaginationProps = {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({page, totalPages, onPageChange}: PaginationProps) {
    return (
        <div className="flex flex-row items-center justify-between h-12 w-full">
            <div>
                <p className="pl-3">
                    Page {page } of {totalPages}
                </p>
            </div>
            <div className=" w-30 flex justify-center gap-3">
                <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="w-8 h-8 rounded-lg border-1 border-mist-600"><FontAwesomeIcon icon={faArrowLeft}/></button>
                <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="w-8 h-8 rounded-lg border-1 border-mist-600"><FontAwesomeIcon icon={faArrowRight}/></button>
            </div>
        </div>
    )
}